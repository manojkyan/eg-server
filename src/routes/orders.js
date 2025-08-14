
import express from "express";
import { db } from "../services/db.js";
import { requireAuth, requireAnyRole } from "./auth.js";

export const ordersRouter = (io) => {
  const router = express.Router();
  const STAGES = ["order","washing","drying","dry wash","wet wash","ironing","qc","ready to pickup","delivery"];

  router.use(requireAuth);

  router.get("/", (req, res) => {
    const rows = db.prepare("SELECT * FROM orders WHERE store_id = ? ORDER BY id DESC").all(req.user.store_id);
    res.json(rows);
  });

  router.post("/", requireAnyRole(["store-admin","staff","billing","manager"]), (req, res) => {
    const { customer_id, items = [], amount = 0, paid = 0, notes = "" } = req.body;
    const code = "EVG" + Date.now().toString().slice(-8);
    const info = db.prepare(`INSERT INTO orders (code,customer_id,store_id,status,items_json,amount,paid,notes,created_by) 
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(code, customer_id, req.user.store_id, "order", JSON.stringify(items), amount, paid, notes, req.user.id);
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(info.lastInsertRowid);
    io.emit("order:new", order);
    res.json(order);
  });

  router.put("/:id/status", requireAnyRole(["production","qc","manager","store-admin","staff"]), (req, res) => {
    const { status } = req.body;
    if (!STAGES.includes(status)) return res.status(400).json({ error: "Invalid stage" });
    db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    io.emit("order:update", order);
    res.json(order);
  });

  router.get("/:id", (req,res)=>{
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    res.json(row||{});
  });

  router.put("/:id", requireAnyRole(["manager","store-admin","staff"]), (req,res)=>{
    const o = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if(!o) return res.status(404).json({error:"Not found"});
    const { items_json=o.items_json, amount=o.amount, paid=o.paid, notes=o.notes } = req.body;
    db.prepare("UPDATE orders SET items_json=?, amount=?, paid=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(JSON.stringify(items_json), amount, paid, notes, req.params.id);
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    io.emit("order:update", row);
    res.json(row);
  });

  router.delete("/:id", requireAnyRole(["manager","store-admin"]), (req,res)=>{
    db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
    res.json({ok:true});
  });

  return router;
};
