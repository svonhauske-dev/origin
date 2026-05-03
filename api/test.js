export default function handler(req, res) {
  res.status(200).json({ ok: true, key: process.env.ANTHROPIC_API_KEY ? "key exists" : "key missing" });
}
