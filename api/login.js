import { getTurso } from "../lib/turso.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let username, password;
  try {
    const body = await request.json();
    username = body.username;
    password = body.password;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
  }

  if (!username || !password) {
    return new Response(JSON.stringify({ error: "Username and password required" }), { status: 400 });
  }

  try {
    const db = getTurso();
    const result = await db.execute({
      sql: "SELECT id, username FROM users WHERE username = ? AND password = ?",
      args: [username.trim(), password],
    });

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    const user = result.rows[0];
    const token = crypto.randomUUID();

    await db.execute({
      sql: "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
      args: [Number(user.id), token],
    });

    return new Response(JSON.stringify({
      token,
      user: { id: Number(user.id), username: String(user.username) },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
