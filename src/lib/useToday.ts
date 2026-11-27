"use client";
// Today's date in India, read only in the browser. On the server (and in cached pages) it is "",
// so prerendered HTML never contains a stale date and hydration stays consistent.
import { useSyncExternalStore } from "react";
import { todayIso } from "./format";

const subscribe = () => () => {};

export function useToday(): string {
  return useSyncExternalStore(subscribe, todayIso, () => "");
}
