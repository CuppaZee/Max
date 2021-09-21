import { loadFromCache, loadFromLzwJson, CuppaZeeDB } from "@cuppazee/db";
import { useEffect, useState } from "react";
import { store } from "./useSetting";
import * as zipson from "zipson";

const dbCache: { value: CuppaZeeDB; onLoad: Set<() => void>; running: boolean } = {
  value: new CuppaZeeDB([], [], []),
  onLoad: new Set(),
  running: false,
};

export const dbLoadLog: string[] = [];

async function loadDB2(cacheVersion: number) {
  try{
    const response = await Promise.race([
      await fetch(`https://db.cuppazee.app/lzw/${cacheVersion}`),
      new Promise<never>((_, r) => setTimeout(r, 3000)),
    ]);
    if (!response.ok) throw "e";
    dbLoadLog.push("Loaded from lzw, Reading.");
    const data = await Promise.race([
      await response.text(),
      new Promise<never>((_, r) => setTimeout(r, 500)),
    ]);
    if (data.length > 0) {
      dbLoadLog.push("Read from lzw, Parsing.");
      const { db, cache } = loadFromLzwJson(data);
      dbLoadLog.push("Parsed from lzw, Succeeded.");
      dbCache.value = db;
      dbCache.onLoad.forEach(i => i());
      store.set("@cz3/dbcache", zipson.stringify(cache));
    } else {
      dbLoadLog.push("Nothing to load from lzw, Suspended.");
    }
  } catch (e) {
    dbLoadLog.push("Failed to load from lzw, Failed.");
  }
}

async function loadDBBase() {
  dbCache.running = true;
  dbLoadLog.push("Loading...");
  let cacheVersion = 0;
  try {
    const cacheData = store.getString("@cz3/dbcache");
    if (cacheData) {
      dbLoadLog.push("Loaded from cache, Continuing.");
      const data = zipson.parse(cacheData);
      cacheVersion = data.version;
      dbCache.value = loadFromCache(data);
      dbCache.onLoad.forEach(i => i());
    } else {
      dbLoadLog.push("No Cache Data, Continuing.")
    }
  } catch (e) { dbLoadLog.push("Failed to load from cache, Continuing.");}
  await loadDB2(cacheVersion);
};

export default function useDB() {
  const [_, setValue] = useState(0);
  useEffect(() => {
    if (!dbCache.running) {
      loadDBBase();
    }
    const f = () => {
      setValue(i => i + 1);
    };
    if (dbCache.value) {
      f()
    }
    dbCache.onLoad.add(f);
    return () => { dbCache.onLoad.delete(f) };
  }, []);
  return dbCache.value;
}