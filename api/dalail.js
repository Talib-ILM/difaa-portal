import { getTurso } from "./_lib/turso.js";
import { verifyAuth } from "./_lib/auth.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = getTurso();

  // GET - list all records
  if (req.method === "GET") {
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
      return res.status(200).json({ records });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch";
      return res.status(500).json({ error: msg });
    }
  }

  // POST - add a record
  if (req.method === "POST") {
    let title, category, content_english, content_arabic, content_urdu;
    try {
      const text = await req.text();
      const body = JSON.parse(text);
      title = body.title;
      category = body.category;
      content_english = body.content_english;
      content_arabic = body.content_arabic;
      content_urdu = body.content_urdu;
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }
    try {
      await db.execute({
        sql: "INSERT INTO dalail (title, category, content_english, content_arabic, content_urdu) VALUES (?, ?, ?, ?, ?)",
        args: [title, category, content_english || "", content_arabic || "", content_urdu || ""],
      });
      return res.status(201).json({ success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add";
      return res.status(500).json({ error: msg });
    }
  }

  // DELETE - remove a record
  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (!id) {
      return res.status(400).json({ error: "ID required" });
    }
    try {
      await db.execute({ sql: "DELETE FROM dalail WHERE id = ?", args: [Number(id)] });
      return res.status(200).json({ success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete";
      return res.status(500).json({ error: msg });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
