import { config } from "./config";

const API_URL = config.API.BASE_URL;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface UserStats {
  totalEmailsScanned: number;
  phishingDetected: number;
  markedSafe: number;
  creditsRemaining: number;
}

export const getUserStats = async (token: string): Promise<UserStats> => {
  const res = await fetch(`${API_URL}/api/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  const d = json.data ?? json;
  return {
    totalEmailsScanned: d.total_emails_scanned ?? 0,
    phishingDetected: d.threats_detected ?? 0,
    markedSafe: 0,
    creditsRemaining: 1000,
  };
};

export const getUserRounds = async (token: string) => {
  const res = await fetch(`${API_URL}/api/rounds`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch rounds");
  const json = await res.json();
  return json.items ?? json.data ?? [];
};
