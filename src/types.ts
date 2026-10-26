export type EntryKind = '随笔' | '日记' | '小说' | '歌词' | '摘抄' | '灵感' | '未分类';
export type Entry = {
  id: string; title: string; body: string; kind: EntryKind; source?: string;
  createdAt: string; updatedAt: string; boardIds: string[]; isDraft?: boolean;
};
export type Book = {
  id: string; title: string; author: string; status: '想读' | '在读' | '已读' | '弃读';
  rating?: number; tags: string[]; note: string; people: string[]; createdAt: string;
  fullContent?: string; platform?: string; sourceUrl?: string; originalRating?: number;
};
export type Board = { id: string; title: string; description?: string; entryIds: string[]; color: 'lime' | 'blue' | 'yellow' };
