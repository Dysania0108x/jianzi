import type { Board, Book, Entry } from './types';
const KEY = 'jianzi.local.v1';
export type AppData = { entries: Entry[]; books: Book[]; boards: Board[] };
const sample: AppData = {
  entries: [
    { id:'e1', title:'长安旧梦', body:'她原以为，那年春天还会很长。\n\n后来才知道，有些故事并不急着写完。', kind:'小说', createdAt:'2024-06-01T12:00:00.000Z', updatedAt:'2024-06-01T12:00:00.000Z', boardIds:['b1'], isDraft:true },
    { id:'e2', title:'雨夜重逢', body:'一个人站在雨里，另一个人隔着街道认出了她。', kind:'灵感', createdAt:'2026-10-22T12:00:00.000Z', updatedAt:'2026-10-22T12:00:00.000Z', boardIds:['b1'] },
    { id:'e3', title:'关于相逢', body:'有些相逢，本就不问归期。', kind:'摘抄', source:'示例摘录', createdAt:'2026-10-25T12:00:00.000Z', updatedAt:'2026-10-25T12:00:00.000Z', boardIds:['b1'] },
    { id:'e4', title:'一小段旋律', body:'把这里换成你喜欢的歌词片段。', kind:'歌词', source:'歌曲 / 歌手', createdAt:'2026-10-20T12:00:00.000Z', updatedAt:'2026-10-20T12:00:00.000Z', boardIds:[] },
    { id:'e5', title:'随手写下的想法', body:'一些还没有想清楚的事。', kind:'随笔', createdAt:'2026-10-21T12:00:00.000Z', updatedAt:'2026-10-21T12:00:00.000Z', boardIds:[] }
  ],
  books: [
    { id:'bk1', title:'琅琊榜', author:'海宴', status:'已读', rating:9.5, tags:['权谋','古言'], note:'喜欢人物之间含蓄的牵挂，也喜欢故事最后留下的余韵。', people:['梅长苏','靖王'], createdAt:'2026-09-18T12:00:00.000Z' },
    { id:'bk2', title:'长安十二时辰', author:'马伯庸', status:'想读', tags:['古风','悬疑'], note:'先收进书单，等一个有空慢慢读的晚上。', people:['张小敬'], createdAt:'2026-10-10T12:00:00.000Z' },
    { id:'bk3', title:'山海来信', author:'虚构作者', status:'已读', rating:8.5, tags:['仙侠','宿命'], note:'文字有余韵。', people:['角色甲','角色乙'], createdAt:'2026-10-12T12:00:00.000Z' }
  ],
  boards: [{ id:'b1', title:'雨夜与重逢', description:'', entryIds:['e1','e2','e3'], color:'lime' }]
};
export function loadData(): AppData {
  try { const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw) as AppData; } catch(e) { console.warn('读取本地数据失败',e); }
  return structuredClone(sample);
}
export function saveData(data: AppData) { try { localStorage.setItem(KEY,JSON.stringify(data)); } catch(e) { console.error('本地保存失败',e); } }
export function newId(prefix: string) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
