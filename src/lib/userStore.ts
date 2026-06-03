import { useEffect, useState } from "react";

const KEY = "docintel.userId";
const NAME_KEY = "docintel.userName";

export function getStoredUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) || "";
}

export function setStoredUserId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("docintel:userid"));
}

export function useUserId() {
  const [userId, setUserId] = useState<string>(getStoredUserId);
  useEffect(() => {
    const handler = () => setUserId(getStoredUserId());
    window.addEventListener("docintel:userid", handler);
    return () => window.removeEventListener("docintel:userid", handler);
  }, []);
  return [userId, (v: string) => { setStoredUserId(v); setUserId(v); }] as const;
}

export function getStoredUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) || "";
}

export function setStoredUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
  window.dispatchEvent(new Event("docintel:username"));
}

export function useUserName() {
  const [userName, setUserName] = useState<string>(getStoredUserName);
  useEffect(() => {
    const handler = () => setUserName(getStoredUserName());
    window.addEventListener("docintel:username", handler);
    return () => window.removeEventListener("docintel:username", handler);
  }, []);
  return [userName, (v: string) => { setStoredUserName(v); setUserName(v); }] as const;
}

export function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return d; }
}
