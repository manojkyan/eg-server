
import express from "express";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { db, initDb, seedDemo } from "./services/db.js";
import { authRouter } from "./routes/auth.js";
import { ordersRouter } from "./routes/orders.js";
import { usersRouter } from "./routes/users.js";
import { customersRouter } from "./routes/customers.js";
import { financeRouter } from "./routes/finance.js";
import { reportsRouter } from "./routes/reports.js";
import { offersRouter } from "./routes/offers.js";
import { settingsRouter } from "./routes/settings.js";
import { chatRouter, wireChatSocket } from "./routes/chat.js";
import { storesRouter } from "./routes/stores.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// DB init
initDb();
if (process.env.ALLOW_DEMO === "true") seedDemo();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter(io));
app.use("/api/users", usersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/finance", financeRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/offers", offersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/stores", storesRouter);

// Static serve (optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = process.env.STATIC_DIR || path.join(__dirname, "../../public");
if (staticDir) {
  app.use(express.static(staticDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

// sockets
wireChatSocket(io);

// start
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Evergreen server running on :${PORT}`);
});
