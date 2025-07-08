import express from "express";
import cors from "cors";
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import schema from "./db/schema";

initializeApp({ credential: applicationDefault() });
const auth = getAuth();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool, { schema });

const app = express();
app.use(cors(), express.json());

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("No token");
  auth.verifyIdToken(token).then(u => { req.user = u; next(); }).catch(() => res.status(401).send("Unauthorized"));
}

function adminOnly(req, res, next) {
  if (["samuel@dnxtai.com","leonardo@dnxtai.com"].includes(req.user.email)) return next();
  res.status(403).send("Acesso restrito");
}

app.post("/api/auth/google", async (req, res) => {
  const { idToken } = req.body;
  const decoded = await auth.verifyIdToken(idToken);
  res.send({ uid: decoded.uid, email: decoded.email });
});

app.use("/api", authMiddleware);

app.get("/api/me", (req, res) => res.send({ uid: req.user.uid, email: req.user.email }));

app.post("/api/messages", async (req, res) => {
  await db.insert(schema.messages).values({
    sender: req.user.uid,
    text: req.body.text,
    timestamp: new Date()
  });
  res.sendStatus(200);
});

app.get("/api/messages", adminOnly, async (req, res) => {
  const msgs = await db.select().from(schema.messages);
  res.send(msgs);
});

app.listen(4000, () => console.log("Server rodando na porta 4000"));
