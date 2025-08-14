
import express from "express";
import { db } from "../services/db.js";
import { requireAuth, requireAnyRole } from "./auth.js";

export const offersRouter = express.Router();
offersRouter.use(requireAuth);

offersRouter.get("/", (req,res)=>{
  const rows = db.prepare("SELECT * FROM offers WHERE store_id = ? AND active=1").all(req.user.store_id);
  res.json(rows);
});

offersRouter.post("/", requireAnyRole(["manager","store-admin"]), (req,res)=>{
  const { title, description, start_date, end_date } = req.body;
  const info = db.prepare("INSERT INTO offers(title,description,start_date,end_date,store_id,active) VALUES (?,?,?,?,?,1)")
    .run(title,description,start_date,end_date,req.user.store_id);
  res.json({ id: info.lastInsertRowid });
});
