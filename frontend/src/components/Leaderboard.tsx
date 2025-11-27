import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };
type Row = { user: string; total: bigint };

const LeaderboardNew: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<Row[]>([]);
  export { default } from "../pages/Leaderboard";
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
