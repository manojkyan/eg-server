
import express from "express";
import { requireAuth, requireAnyRole } from "./auth.js";
import { db } from "../services/db.js";

export const settingsRouter = express.Router();
settingsRouter.use(requireAuth);

settingsRouter.get("/me", (req,res)=>{
  const user = db.prepare("SELECT id,name,email,role,store_id FROM users WHERE id = ?").get(req.user.id);
  res.json({ user });
});

settingsRouter.get("/login-history", requireAnyRole(["manager","store-admin"]), (req,res)=>{
  const rows = db.prepare("SELECT * FROM login_history ORDER BY id DESC LIMIT 200").all();
  res.json(rows);
});
