
import express from "express";
import { db } from "../services/db.js";
import { requireAuth, requireAnyRole } from "./auth.js";

export const financeRouter = express.Router();
financeRouter.use(requireAuth);

financeRouter.get("/summary", requireAnyRole(["accountant","manager","store-admin"]), (req,res)=>{
  const income = db.prepare("SELECT IFNULL(SUM(paid),0) s FROM orders WHERE store_id = ?").get(req.user.store_id).s || 0;
  const expenses = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE store_id = ?").get(req.user.store_id).s || 0;
  res.json({ income, expenses, profit: income - expenses });
});

financeRouter.post("/expense", requireAnyRole(["accountant","manager","store-admin"]), (req,res)=>{
  const { label, amount } = req.body;
  const info = db.prepare("INSERT INTO expenses(label, amount, store_id, created_by) VALUES (?,?,?,?)")
    .run(label, amount, req.user.store_id, req.user.id);
  res.json({ id: info.lastInsertRowid });
});
