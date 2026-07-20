import { getTurso } from "../lib/turso.js";

export async function verifyAuth(request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const db = getTurso();
  const result = await db.execute({
    sql: "SELECT u.id, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?",
    args: [token],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { id: Number(row.id), username: String(row.username) };
}
