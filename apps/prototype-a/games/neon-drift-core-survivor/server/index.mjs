import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 4174;
const DATA_DIR = path.resolve("./server/data");
const DB_PATH = path.join(DATA_DIR, "leaderboard.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]", "utf8");

app.use(cors());
app.use(express.json());

function readBoard() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeBoard(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/leaderboard", (req, res) => {
  const difficulty = req.query.difficulty;
  let rows = readBoard();
  if (difficulty) rows = rows.filter((r) => r.difficulty === difficulty);
  rows.sort((a, b) => b.score - a.score || b.survived - a.survived);
  res.json(rows.slice(0, 20));
});

app.post("/leaderboard", (req, res) => {
  const { name, score, survived, difficulty } = req.body || {};
  if (!name || typeof score !== "number" || typeof survived !== "number" || !difficulty) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name).slice(0, 12),
    score: Math.max(0, Math.floor(score)),
    survived: Math.max(0, Math.floor(survived)),
    difficulty: String(difficulty),
    createdAt: new Date().toISOString(),
  };

  const board = readBoard();
  board.push(row);
  writeBoard(board);
  return res.json({ ok: true, row });
});

app.listen(PORT, () => {
  console.log(`[urion-phaser-api] listening on :${PORT}`);
});
