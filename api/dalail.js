import { verifyAuth } from "./lib/auth.js";
import { getTurso } from "./lib/turso.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const db = getTurso();
  const url = new URL(request.url);

  if (request.method === "GET") {
    try {
      const result = await db.execute("SELECT * FROM dalail ORDER BY id DESC");
      const records = result.rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title ?? ""),
        category: String(row.category ?? ""),
        content_english: String(row.content_english ?? ""),
        content_urdu: String(row.content_urdu ?? ""),
        content_arabic: String(row.content_arabic ?? ""),
      }));
      return new Response(JSON.stringify({ records }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch";
      return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
  }

  if (request.method === "POST") {
    let title, category, content_english, content_arabic, content_urdu;
    try {
      const body = await request.json();
      title = body.title;
      category = body.category;
      content_english = body.content_english;
      content_arabic = body.content_arabic;
      content_urdu = body.content_urdu;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
    }
    if (!title || !category) {
      return new Response(JSON.stringify({ error: "Title and category required" }), { status: 400 });
    }
    try {
      await db.execute({
        sql: "INSERT INTO dalail (title, category, content_english, content_arabic, content_urdu) VALUES (?, ?, ?, ?, ?)",
        args: [title, category, content_english || "", content_arabic || "", content_urdu || ""],
      });
      return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add";
      return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), { status: 400 });
    }
    try {
      await db.execute({ sql: "DELETE FROM dalail WHERE id = ?", args: [Number(id)] });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete";
      return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}
