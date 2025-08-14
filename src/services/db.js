
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const DB_FILE = process.env.DB_FILE || "./data/evergreen.db";
export const db = new Database(DB_FILE);

export function initDb() {
  db.pragma("journal_mode = WAL");
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    store_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    code TEXT UNIQUE,
    address TEXT,
    phone TEXT
  );
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    store_id INTEGER,
    wallet REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    customer_id INTEGER,
    store_id INTEGER,
    status TEXT,
    items_json TEXT,
    amount REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    store_id INTEGER,
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    amount REAL,
    store_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    created_by INTEGER,
    store_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip TEXT,
    ua TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  `);
}

export function seedDemo() {
  // create demo store & super admin if not exists
  const storeCount = db.prepare("SELECT COUNT(*) c FROM stores").get().c;
  if (storeCount === 0) {
    db.prepare("INSERT INTO stores (name, code, address, phone) VALUES (?, ?, ?, ?)").run(
      "Evergreen HQ", "HQ", "Lakshmanampatty, Karur-102", "+91-99999-99999"
    );
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get("super-admin@evergreen.test");
  if (!user) {
    const hash = bcrypt.hashSync("password123", 10);
    db.prepare("INSERT INTO users (name,email,password_hash,role,store_id) VALUES (?,?,?,?,?)").run(
      "Super Admin", "super-admin@evergreen.test", hash, "super-admin", 1
    );
  }
}
