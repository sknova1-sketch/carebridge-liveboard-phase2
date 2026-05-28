import { get } from "@vercel/blob";

const BLOB_NAME = "visitors.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const result = await get(BLOB_NAME, { access: "public" });
    if (!result) throw new Error("no data");
    const data = await new Response(result.stream).json();

    // Return last 30 days as sorted array
    const today = new Date();
    const rows = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      rows.push({ key, total: data[key] || 0, devices: data[key] || 0 });
    }
    res.status(200).json({ data: rows });
  } catch (e) {
    // No data yet — return 30 empty days
    const today = new Date();
    const rows = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      rows.push({ key: d.toISOString().slice(0, 10), total: 0, devices: 0 });
    }
    res.status(200).json({ data: rows });
  }
}
