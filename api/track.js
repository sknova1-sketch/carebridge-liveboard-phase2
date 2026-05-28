import { put, get } from "@vercel/blob";

const BLOB_NAME = "visitors.json";

async function readVisitors() {
  try {
    const result = await get(BLOB_NAME, { access: "private" });
    if (!result) return {};
    return await new Response(result.stream).json();
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const data = await readVisitors();
    const today = new Date().toISOString().slice(0, 10);
    data[today] = (data[today] || 0) + 1;

    // Keep only last 60 days
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    Object.keys(data).forEach(k => { if (k < cutoff) delete data[k]; });

    await put(BLOB_NAME, JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    res.status(200).json({ ok: true, today: data[today] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
