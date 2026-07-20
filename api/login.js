import { getTurso } from "./_lib/turso.js";
import { randomBytes } from "crypto";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let username, password;
  try {
    const text = await req.text();
    const body = JSON.parse(text);
    username = body.username;
    password = body.password;
  } catch {
    return res.status(400).json({ error: "Invalid request body" });
  }
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const db = getTurso();
    const result = await db.execute({
      sql: "SELECT id, username FROM users WHERE username = ? AND password = ?",
      args: [username.trim(), password],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const token = randomBytes(32).toString("hex");

    await db.execute({
      sql: "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
      args: [Number(user.id), token],
    });

    return res.status(200).json({
      token,
      user: { id: Number(user.id), username: String(user.username) },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return res.status(500).json({ error: msg });
  }
}
