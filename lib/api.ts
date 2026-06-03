import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolve a full URL for an Expo Router API route.
 * - Web: same origin, so a relative path is fine.
 * - Native (Expo Go / device): use the Metro dev server host that served the app.
 */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (Platform.OS === "web") return clean;

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.split("/")[0]; // strip any path
    return `http://${host}${clean}`;
  }
  return clean;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error ?? `Request failed (${res.status})`);
    (err as any).status = res.status;
    (err as any).noKey = data?.noKey;
    throw err;
  }
  return data as T;
}
