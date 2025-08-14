
import express from "express";
import { db } from "../services/db.js";
import { requireAuth, requireRole } from "./auth.js";

export const usersRouter = express.Router();
usersRouter.use(requireAuth);

usersRouter.get("/", requireRole("manager"), (req, res)=>{
  const rows = db.prepare("SELECT id,name,email,role,store_id,active,created_at FROM users").all();
  res.json(rows);
});

usersRouter.post("/", requireRole("manager"), (req,res)=>{
  const { name, email, role="staff", store_id=1, password="password123" } = req.body;
  const hash = require("bcryptjs").hashSync(password, 10);
  const info = db.prepare("INSERT INTO users(name,email,password_hash,role,store_id) VALUES (?,?,?,?,?)")
    .run(name,email,hash,role,store_id);
  res.json({id: info.lastInsertRowid});
});
