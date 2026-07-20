import { connect } from "@tursodatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sql, args } = req.body || {};
  if (!sql) {
    return res.status(400).json({ error: "No SQL provided" });
  }

  try {
    const db = connect({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const result = await db.execute({
      sql,
      args: (args || []).map(a => String(a)),
    });
    const rows = result.rows.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => { obj[col] = row[i] ?? ""; });
      return obj;
    });
    return res.status(200).json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Query failed" });
  }
}
