"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import * as storage from "@/lib/storage";

const EMPTY_SNAPSHOT = {
  booted: false,
  user: null,
  materials: [],
  results: [],
};

let snapshot = null;
const listeners = new Set();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStore() {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  const user = storage.getCurrentUser();
  if (!user) return { ...EMPTY_SNAPSHOT, booted: true };
  return {
    booted: true,
    user,
    materials: storage.getMaterials(user.id),
    results: storage.getResults(user.id),
  };
}

function getSnapshot() {
  if (snapshot === null) snapshot = readStore();
  return snapshot;
}

function refresh() {
  snapshot = readStore();
  emitChange();
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { booted, user, materials, results } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_SNAPSHOT,
  );

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      booted,
      user,
      materials,
      results,
      login: (payload) => {
        const result = storage.loginUser(payload);
        if (result.user) refresh();
        return result;
      },
      register: (payload) => {
        const result = storage.registerUser(payload);
        if (result.user) refresh();
        return result;
      },
      logout: () => {
        storage.logoutUser();
        refresh();
      },
      setClassLevel: (classLevel) => {
        storage.updateClassLevel(classLevel);
        refresh();
      },
      refresh,
    }),
    [booted, user, materials, results],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData harus dipakai di dalam <DataProvider>");
  }
  return context;
}
