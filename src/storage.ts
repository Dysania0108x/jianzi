import { isTauri } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import type { Board, Book, Entry } from './types';

const KEY = 'jianzi.local.v1';
export type AppData = { entries: Entry[]; books: Book[]; boards: Board[] };
type StateRow = { payload: string };
let db: Database | null = null;
let persistenceReady = false;
let saveChain: Promise<void> = Promise.resolve();

const sample: AppData = { entries: [], books: [], boards: [] };

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch (error) {
    console.warn('无法读取浏览器演示数据。', error);
  }
  return structuredClone(sample);
}

/** Load SQLite on the Tauri desktop app. Browser previews use localStorage. */
export async function initializePersistence(): Promise<AppData> {
  if (!isTauri()) {
    persistenceReady = true;
    return loadData();
  }
  try {
    db = await Database.load('sqlite:jianzi.db');
    await db.execute('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL)');
    const rows = await db.select<StateRow[]>('SELECT payload FROM app_state WHERE id = 1');
    if (rows.length > 0) {
      persistenceReady = true;
      return JSON.parse(rows[0].payload) as AppData;
    }
    const initial = loadData();
    await db.execute('INSERT INTO app_state (id, payload) VALUES (1, $1) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload', [JSON.stringify(initial)]);
    persistenceReady = true;
    return initial;
  } catch (error) {
    console.error('SQLite 初始化失败，暂时使用浏览器本地存储。', error);
    db = null;
    persistenceReady = true;
    return loadData();
  }
}

/** Save sequentially so quick typing cannot leave the database with an older snapshot. */
export function saveData(data: AppData): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.error('浏览器本地备份写入失败。', error);
  }
  if (!persistenceReady || !db) return Promise.resolve();
  const payload = JSON.stringify(data);
  saveChain = saveChain.catch(() => undefined).then(async () => {
    if (!db) return;
    await db.execute('INSERT INTO app_state (id, payload) VALUES (1, $1) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload', [payload]);
  }).catch(error => {
    console.error('SQLite 保存失败。请尽快导出 JSON 备份。', error);
  });
  return saveChain;
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
