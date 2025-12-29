// utils/parseRemarks.ts
export interface Remark {
  by: "admin" | "user";
  user_id: number;
  username: string;
  message: string;
  timestamp: string;
}

export function parseRemarks(raw?: string): Remark[] {
  if (!raw) return [];

  return raw
    .split("\n")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Remark[];
}
