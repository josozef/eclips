import { Clip, ConnectedAccount } from "@/types";

export async function fetchClips(): Promise<Clip[]> {
  const res = await fetch("/api/clips");
  if (!res.ok) {
    console.error("Error fetching clips:", res.statusText);
    return [];
  }
  return res.json();
}

export async function syncUser(): Promise<void> {
  await fetch("/api/user/sync", { method: "POST" });
}

export async function syncClips(): Promise<void> {
  await fetch("/api/sync", { method: "POST" });
}

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  const res = await fetch("/api/accounts");
  if (!res.ok) return [];
  return res.json();
}

export async function disconnectAccount(provider: string): Promise<boolean> {
  const res = await fetch("/api/accounts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  return res.ok;
}
