
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../services/db.js";

export const authRouter = express.Router();

function tokenFor(user) {
  const payload = { id: user.id, role: user.role, store_id: user.store_id, name: user.name, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
}

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ? AND active = 1").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash || "")) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  db.prepare("INSERT INTO login_history(user_id, ip, ua) VALUES (?,?,?)").run(user.id, req.ip, req.headers["user-agent"]);
  res.json({ token: tokenFor(user), user });
});

authRouter.post("/register", (req, res) => {
  const { name, email, password, role = "staff", store_id = 1 } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare("INSERT INTO users (name,email,password_hash,role,store_id) VALUES (?,?,?,?,?)").run(name, email, hash, role, store_id);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.json({ token: tokenFor(user), user });
  } catch (e) {
    res.status(400).json({ error: "User exists?" });
  }
});

// simple middleware
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role && req.user.role !== "super-admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role === "super-admin" || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}
