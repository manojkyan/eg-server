
import express from "express";
import { requireAuth } from "./auth.js";
export const chatRouter = express.Router();

chatRouter.use(requireAuth);
chatRouter.get("/health", (_req,res)=> res.json({ok:true}));

export function wireChatSocket(io){
  io.on("connection", (socket)=>{
    socket.on("chat:message", (msg)=>{
      io.emit("chat:message", msg);
    });
  })
}
