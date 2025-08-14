
import express from "express";
import { db } from "../services/db.js";
import { requireAuth } from "./auth.js";

export const customersRouter = express.Router();
customersRouter.use(requireAuth);

customersRouter.get("/", (req,res)=>{
  const rows = db.prepare("SELECT * FROM customers WHERE store_id = ? ORDER BY id DESC").all(req.user.store_id);
  res.json(rows);
});

customersRouter.post("/", (req,res)=>{
  const { name, phone, email, address } = req.body;
  const info = db.prepare("INSERT INTO customers(name,phone,email,address,store_id) VALUES (?,?,?,?,?)")
    .run(name,phone,email,address,req.user.store_id);
  res.json({ id: info.lastInsertRowid });
});
