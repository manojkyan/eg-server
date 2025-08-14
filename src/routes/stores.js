
import express from "express";
import { db } from "../services/db.js";
import { requireAuth, requireAnyRole } from "./auth.js";

export const storesRouter = express.Router();
storesRouter.use(requireAuth);

storesRouter.get("/", (req,res)=>{
  const rows = db.prepare("SELECT * FROM stores").all();
  res.json(rows);
});

storesRouter.post("/", requireAnyRole(["super-admin","manager","store-admin"]), (req,res)=>{
  const { name, code, address, phone } = req.body;
  const info = db.prepare("INSERT INTO stores(name,code,address,phone) VALUES (?,?,?,?)").run(name,code,address,phone);
  res.json({ id: info.lastInsertRowid });
});
