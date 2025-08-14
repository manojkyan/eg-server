
import express from "express";
import { db } from "../services/db.js";
import { requireAuth } from "./auth.js";

export const reportsRouter = express.Router();
reportsRouter.use(requireAuth);

reportsRouter.get("/orders-by-status", (req,res)=>{
  const rows = db.prepare("SELECT status, COUNT(*) as count FROM orders WHERE store_id = ? GROUP BY status").all(req.user.store_id);
  res.json(rows);
});
