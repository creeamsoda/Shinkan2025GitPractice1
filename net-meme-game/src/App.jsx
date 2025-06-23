import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // shadcn風UI
import "./App.css";

const words1 = ["ゴッド", "ドロッセル", "魔導", "量産型", "虚無", "深淵"];
const words2 = ["フィールド", "マイヤー", "工場長", "の散歩", "アタック", "の断末魔"];

const getRandomWords = () =>
  `${words1[Math.floor(Math.random() * words1.length)]}${words2[Math.floor(Math.random() * words2.length)]}`;

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [phase, setPhase] = useState("setup"); // setup | playing | voting | results
  const [round, setRound] = useState(1);
  const [entries, setEntries] = useState({});
  const [votes, setVotes] = useState({});
  const [timer, setTimer] = useState(30);
  const [prompt, setPrompt] = useState("");
  const [scores, setScores] = useState({});

  // タイマー処理
  useEffect(() => {
    if (phase === "playing" && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (phase === "playing" && timer === 0) {
      setPhase("voting");
    }
  }, [timer, phase]);

  // スコア更新
  const tallyVotes = () => {
    const tally = { ...scores };
    Object.values(votes).forEach((voteName) => {
      tally[voteName] = (tally[voteName] || 0) + 1;
    });
    setScores(tally);
  };

  const nextRound = () => {
    if (round >= 3) {
      setPhase("results");
    } else {
      setRound(round + 1);
      setPrompt(getRandomWords());
      setTimer(30);
      setEntries({});
      setVotes({});
      setPhase("playing");
    }
  };

  // JSXの切り替え
  if (phase === "setup") {
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold">ネットミームゲーム</h1>
        <input
          className="border px-2 py-1 rounded"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="プレイヤー名"
        />
        <Button
          onClick={() => {
            if (nameInput && !players.includes(nameInput)) {
              setPlayers([...players, nameInput]);
              setScores({ ...scores, [nameInput]: 0 });
              setNameInput("");
            }
          }}
        >
          追加
        </Button>
        <div>参加者: {players.join(", ")}</div>
        {players.length >= 2 && (
          <Button
            onClick={() => {
              setPrompt(getRandomWords());
              setPhase("playing");
            }}
          >
            ゲーム開始
          </Button>
        )}
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">第 {round} ラウンド</h2>
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.2 }}
          className="text-3xl font-bold text-purple-600"
        >
          お題：{prompt}
        </motion.h1>
        <div>残り時間: {timer} 秒</div>
        {players.map((p) => (
          <div key={p} className="flex gap-2">
            <span>{p}：</span>
            <input
              type="text"
              className="border px-2 py-1"
              disabled={entries[p]}
              onBlur={(e) =>
                setEntries((prev) => ({ ...prev, [p]: e.target.value }))
              }
              placeholder="ここに投稿"
            />
          </div>
        ))}
      </div>
    );
  }

  if (phase === "voting") {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">投票タイム！</h2>
        {Object.entries(entries).map(([name, entry]) => (
          <div key={name} className="border p-2 rounded bg-gray-100">
            {name}：「{entry}」
          </div>
        ))}
        {players.map((p) => (
          <div key={p} className="flex gap-2">
            <span>{p}の投票：</span>
            <select
              onChange={(e) =>
                setVotes((prev) => ({ ...prev, [p]: e.target.value }))
              }
              defaultValue=""
            >
              <option value="" disabled>
                誰に投票？
              </option>
              {players
                .filter((name) => name !== p)
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
        ))}
        {Object.keys(votes).length === players.length && (
          <Button
            onClick={() => {
              tallyVotes();
              nextRound();
            }}
          >
            次のラウンドへ
          </Button>
        )}
      </div>
    );
  }

  if (phase === "results") {
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">🏆 結果発表 🏆</h1>
        <p className="text-xl">優勝：{winner[0]}（{winner[1]} 点）</p>
        <div className="mt-4 space-y-2">
          {Object.entries(scores).map(([name, score]) => (
            <div key={name}>
              {name}：{score} 点
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
