import { verifyAuth } from "./lib/auth.js";
import { getTurso } from "./lib/turso.js";

export default async function handler(req, res) {
  const user = await verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = getTurso();

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
      return res.status(500).json({ error: error.message || "Failed to fetch" });
    }
  }

  if (req.method === "POST") {
    const { title, category, content_english, content_arabic, content_urdu } = req.body || {};
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category required" });
    }
    try {
      await db.execute({
        sql: "INSERT INTO dalail (title, category, content_english, content_arabic, content_urdu) VALUES (?, ?, ?, ?, ?)",
        args: [title, category, content_english || "", content_arabic || "", content_urdu || ""],
      });
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to add" });
    }
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (!id) {
      return res.status(400).json({ error: "ID required" });
    }
    try {
      await db.execute({ sql: "DELETE FROM dalail WHERE id = ?", args: [Number(id)] });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to delete" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
