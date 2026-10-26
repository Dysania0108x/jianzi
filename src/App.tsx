import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, LayoutGrid, List, Pencil, Plus, Search, Shuffle, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { initializePersistence, loadData, newId, saveData, type AppData } from './storage';
import type { Book, Entry, EntryKind } from './types';

type View = '文字' | '灵感墙' | '书单';
const kinds: EntryKind[] = ['随笔','日记','小说','歌词','摘抄','灵感','未分类'];
const dateLabel = (s:string) => { const d=new Date(s); return Number.isNaN(d.getTime())?'':`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; };

export default function App() {
  const [data,setData] = useState<AppData>(()=>loadData());
  const [ready,setReady] = useState(false);
  const [view,setView] = useState<View>('文字');
  const [query,setQuery] = useState('');
  const [kindFilter,setKindFilter] = useState('全部');
  const [statusFilter,setStatusFilter] = useState('全部');
  const [ratingFilter,setRatingFilter] = useState('不限');
  const [sortBy,setSortBy] = useState('最近添加');
  const [bookSortBy,setBookSortBy] = useState('最近添加');
  const [showFilters,setShowFilters] = useState(false);
  const [editor,setEditor] = useState<Entry|null>(null);
  const [bookEditor,setBookEditor] = useState<Book|null>(null);
  const [adding,setAdding] = useState(false);
  const [newBoard,setNewBoard] = useState(false);
  const [newBoardTitle,setNewBoardTitle] = useState('');
  const [activeBoard,setActiveBoard] = useState<string|null>(null);
  const [boardView,setBoardView] = useState<'cards'|'list'>('cards');
  const [renameBoard,setRenameBoard] = useState<string|null>(null);
  const [renameValue,setRenameValue] = useState('');
  const [addingToBoard,setAddingToBoard] = useState<string|null>(null);
  const [pendingDelete,setPendingDelete] = useState<{kind:'entry'|'book'|'board';id:string}|null>(null);

  useEffect(()=>{
    let alive = true;
    initializePersistence().then(loaded => { if(alive){ setData(loaded); setReady(true); } }).catch(error => { console.error('初始化本地数据失败', error); if(alive) setReady(true); });
    return () => { alive = false; };
  },[]);
  useEffect(()=>{ if(ready) void saveData(data); },[data,ready]);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.getElementById('search')?.focus();} if(e.key==='Escape'){setPendingDelete(null);setEditor(null);setBookEditor(null);setAdding(false);setNewBoard(false);} };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[]);

  const setEntry=(item:Entry)=>setData(d=>({...d,entries:d.entries.map(e=>e.id===item.id?{...item,updatedAt:new Date().toISOString()}:e)}));
  const startEntry=(kind:EntryKind='未分类')=>{
    const now=new Date().toISOString();const item:Entry={id:newId('entry'),title:'',body:'',kind,createdAt:now,updatedAt:now,boardIds:addingToBoard?[addingToBoard]:[]};
    setData(d=>({...d,entries:[item,...d.entries],boards:d.boards.map(b=>b.id===addingToBoard?{...b,entryIds:[...b.entryIds,item.id]}:b)}));
    setEditor(item);setAdding(false);setAddingToBoard(null);setView('文字');
  };
  const setBook=(item:Book)=>setData(d=>({...d,books:d.books.map(b=>b.id===item.id?item:b)}));
  const startBook=()=>{const b:Book={id:newId('book'),title:'',author:'',status:'想读',tags:[],note:'',people:[],createdAt:new Date().toISOString()};setData(d=>({...d,books:[b,...d.books]}));setBookEditor(b);};
  const confirmDelete=()=>{
    if(!pendingDelete) return;
    const {kind,id}=pendingDelete;
    if(kind==='entry'){
      setData(d=>({...d,entries:d.entries.filter(e=>e.id!==id),boards:d.boards.map(b=>({...b,entryIds:b.entryIds.filter(itemId=>itemId!==id)}))}));
      setEditor(null);
    } else if(kind==='book'){
      setData(d=>({...d,books:d.books.filter(b=>b.id!==id)}));
      setBookEditor(null);
    } else {
      setData(d=>({...d,boards:d.boards.filter(b=>b.id!==id),entries:d.entries.map(e=>({...e,boardIds:e.boardIds.filter(boardId=>boardId!==id)}))}));
      setActiveBoard(null);
    }
    setPendingDelete(null);
  };
  const saveBoardName=()=>{const name=renameValue.trim();if(renameBoard&&name)setData(d=>({...d,boards:d.boards.map(b=>b.id===renameBoard?{...b,title:name}:b)}));setRenameBoard(null);};
  const createBoard=()=>{const b={id:newId('board'),title:newBoardTitle.trim()||'未命名灵感墙',description:'',entryIds:[],color:'lime' as const};setData(d=>({...d,boards:[b,...d.boards]}));setActiveBoard(b.id);setNewBoardTitle('');setNewBoard(false);};
  const toggleBoard=(entryId:string,boardId:string)=>{
    setData(d=>({...d,entries:d.entries.map(e=>e.id===entryId?{...e,boardIds:e.boardIds.includes(boardId)?e.boardIds.filter(x=>x!==boardId):[...e.boardIds,boardId]}:e),boards:d.boards.map(b=>b.id===boardId?{...b,entryIds:b.entryIds.includes(entryId)?b.entryIds.filter(x=>x!==entryId):[...b.entryIds,entryId]}:b)}));
  };
  const entries=useMemo(()=>data.entries.filter(e=>(!query||`${e.title} ${e.body} ${e.source||''} ${e.kind}`.toLowerCase().includes(query.toLowerCase()))&&(kindFilter==='全部'||e.kind===kindFilter)).sort((a,b)=>sortBy==='最早添加'?a.createdAt.localeCompare(b.createdAt):b.updatedAt.localeCompare(a.updatedAt)),[data.entries,query,kindFilter,sortBy]);
  const books=useMemo(()=>data.books.filter(b=>(!query||`${b.title} ${b.author} ${b.note} ${b.tags.join(' ')} ${b.people.join(' ')}`.toLowerCase().includes(query.toLowerCase()))&&(statusFilter==='全部'||b.status===statusFilter)&&(ratingFilter==='不限'||(b.rating??0)>=Number(ratingFilter))).sort((a,b)=>bookSortBy==='评分最高'?(b.rating??0)-(a.rating??0):b.createdAt.localeCompare(a.createdAt)),[data.books,query,statusFilter,ratingFilter,bookSortBy]);
  const boardEntries=(id:string)=>data.entries.filter(e=>data.boards.find(b=>b.id===id)?.entryIds.includes(e.id));
  const randomNote=()=>{const list=data.entries.filter(e=>e.title||e.body);if(list.length)setEditor(list[Math.floor(Math.random()*list.length)]);};
  const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`见字-备份-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);};

  return <div className="app-shell">
    <header className="topbar">
      <button className="wordmark" onClick={()=>{setView('文字');setEditor(null);setBookEditor(null)}}>见字<span>。</span></button>
      <nav className="main-nav">{(['文字','灵感墙','书单'] as View[]).map(v=><button key={v} className={`nav-item ${view===v?'active':''}`} onClick={()=>{setView(v);setEditor(null);setBookEditor(null)}}>{v}</button>)}</nav>
      <div className="top-actions">{view!=='书单'&&<label className="global-search"><Search size={15}/><input id="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索"/><kbd>⌘ K</kbd></label>}{view==='文字'&&<button className="button button-primary add-top" onClick={()=>{setAddingToBoard(null);setAdding(true)}}><Plus size={15}/><span>留下一笔</span></button>}</div>
    </header>
    <main className="page">
      {view==='文字'&&<>
        <section className="page-heading"><div><h1>文字</h1></div></section>
        <div className="toolbar"><div className="chip-row">{['全部',...kinds].map(k=><button key={k} className={`filter-chip ${kindFilter===k?'selected':''}`} onClick={()=>setKindFilter(k)}>{k}</button>)}</div><div className="toolbar-right"><select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="排序"><option>最近添加</option><option>最早添加</option></select><button className="button button-quiet" onClick={randomNote}><Shuffle size={14}/> 随便翻翻</button><button className="button button-outline" onClick={()=>setAdding(true)}><Plus size={14}/> 新建</button></div></div>
        <div className="entries-list">{entries.map((e,i)=><button className="entry-row" key={e.id} onClick={()=>setEditor(e)}><span className="entry-index">{String(i+1).padStart(2,'0')}</span><span className="entry-main"><strong>{e.title||e.body.slice(0,25)||'未命名'}</strong><span className="entry-meta">{e.kind}{e.source?` · ${e.source}`:''} · {dateLabel(e.updatedAt)}</span><span className="entry-preview">{e.body.slice(0,94)||'空白稿件'}</span></span><ArrowUpRight className="entry-arrow" size={17}/></button>)}
          {!entries.length&&<div className="empty-state"><img className="empty-dog" src="/doodles/gemini-dog-1.webp" alt="" aria-hidden="true"/><p>没有找到文字</p><button className="button button-outline" onClick={()=>{setQuery('');setKindFilter('全部')}}>清除筛选</button></div>}</div>
      </>}

      {view==='灵感墙'&&<>
        <section className="page-heading"><div><h1>灵感墙</h1></div></section>
        <div className="board-tabs"><button className={`board-tab ${activeBoard===null?'active':''}`} onClick={()=>setActiveBoard(null)}>全部</button>{data.boards.map(b=><button key={b.id} className={`board-tab ${activeBoard===b.id?'active':''}`} onClick={()=>setActiveBoard(b.id)}>{b.title}</button>)}</div>
        {activeBoard===null&&<div className="board-view-switch"><button className={boardView==='cards'?'active':''} onClick={()=>setBoardView('cards')} aria-label="卡片视图" title="卡片视图"><LayoutGrid size={16}/></button><button className={boardView==='list'?'active':''} onClick={()=>setBoardView('list')} aria-label="列表视图" title="列表视图"><List size={16}/></button></div>}
        {activeBoard===null?(boardView==='cards'?<div className="board-overview">{data.boards.map((b,i)=><div key={b.id} className={`board-cover board-color-${i%3}`}><button className="board-cover-open" onClick={()=>setActiveBoard(b.id)}><span className="board-cover-count">{String(b.entryIds.length).padStart(2,'0')} NOTES</span><strong>{b.title}</strong><span className="board-cover-bottom">{b.description||''}</span><img className="board-dog" src={["/doodles/gemini-dog-4.webp","/doodles/gemini-dog-5.webp","/doodles/gemini-dog-8.webp","/doodles/gemini-dog-7.webp"][i%4]} alt="" aria-hidden="true"/></button><button className="board-card-edit" onClick={()=>{setRenameBoard(b.id);setRenameValue(b.title)}} title="重命名" aria-label="重命名"><Pencil size={14}/></button></div>)}<button className="board-create-tile" onClick={()=>setNewBoard(true)}><img className="peek-dog" src="/doodles/gemini-dog-6.webp" alt="" aria-hidden="true"/><Plus size={20}/><span>新建一面墙</span></button></div>:<div className="board-list">{data.boards.map((b,i)=><div className="board-list-row" key={b.id}><button className="board-list-open" onClick={()=>setActiveBoard(b.id)}><span>{String(i+1).padStart(2,'0')}</span><strong>{b.title}</strong><span>{b.entryIds.length} 条文字</span><ArrowUpRight size={15}/></button><button className="board-rename-button" onClick={()=>{setRenameBoard(b.id);setRenameValue(b.title)}} title="重命名" aria-label="重命名"><Pencil size={15}/></button></div>)}<button className="board-list-add" onClick={()=>setNewBoard(true)}><Plus size={15}/> 新建一面墙</button></div>):
          <><div className="board-controls"><button className="board-title-edit" onClick={()=>{setRenameBoard(activeBoard);setRenameValue(data.boards.find(b=>b.id===activeBoard)?.title||'')}} title="修改名称">{data.boards.find(b=>b.id===activeBoard)?.title}<Pencil size={13}/></button><div className="board-actions"><button className="button button-danger" onClick={()=>setPendingDelete({kind:'board',id:activeBoard})}><Trash2 size={14}/> 删除墙</button><button className="button button-outline" onClick={()=>{setAddingToBoard(activeBoard);setAdding(true)}}><Plus size={14}/> 从文字中添加</button></div></div>
          <div className="inspiration-canvas">{boardEntries(activeBoard).length?boardEntries(activeBoard).map((e,i)=><button key={e.id} className={`quote-block quote-block-${i%5}`} onClick={()=>setEditor(e)}><span className="quote-kind">{e.kind}</span><strong>{e.body||e.title||'未命名'}</strong>{e.source&&<span className="quote-source">{e.source}</span>}<ArrowUpRight className="quote-link" size={15}/></button>):<div className="empty-state"><img className="empty-dog" src="/doodles/gemini-dog-8.webp" alt="" aria-hidden="true"/><p>这面墙还空着</p><button className="button button-outline" onClick={()=>{setAddingToBoard(activeBoard);setAdding(true)}}>从文字中添加</button></div>}</div></>}
      </>}

      {view==='书单'&&<>
        <section className="page-heading book-heading"><div><h1>书单</h1></div></section>
        <div className="book-toolbar"><div className="book-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="书名、作者、人物、标签、感想"/></div><button className={`button button-outline ${showFilters?'is-on':''}`} onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={14}/> 筛选</button><select value={bookSortBy} onChange={e=>setBookSortBy(e.target.value)} aria-label="书单排序"><option>最近添加</option><option>评分最高</option></select></div>
        {showFilters&&<div className="advanced-filters"><label>阅读状态<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>全部</option><option>想读</option><option>在读</option><option>已读</option><option>弃读</option></select></label><label>最低评分<select value={ratingFilter} onChange={e=>setRatingFilter(e.target.value)}><option value="不限">不限</option><option value="6">6 分</option><option value="7">7 分</option><option value="8">8 分</option><option value="9">9 分</option></select></label><button className="text-button" onClick={()=>{setStatusFilter('全部');setRatingFilter('不限')}}>重置</button></div>}
        <div className="book-grid">{books.map((b,i)=><button className="book-card" key={b.id} onClick={()=>setBookEditor(b)}><div className="book-card-top"><span className="book-number">{String(i+1).padStart(2,'0')}</span><span className="book-rating">{b.rating?b.rating.toFixed(1):'—'}</span></div><h2>{b.title||'未命名书籍'}</h2><div className="book-author">{b.author||'作者未填写'} <span>·</span> {b.status}</div><div className="book-tags">{b.tags.slice(0,4).map(t=><span key={t}>{t}</span>)}</div><p className="book-note">{b.note||'还没有写下感想。'}</p><div className="book-card-bottom"><span>{b.people.length?`人物：${b.people.slice(0,2).join('、')}`:'个人收藏'}</span><ArrowUpRight size={15} className="entry-arrow"/></div></button>)}<button className="book-add-card" onClick={startBook}><Plus size={18}/><span>收藏一本书</span></button></div>
        {!books.length&&<div className="empty-state"><img className="empty-dog" src="/doodles/gemini-dog-5.webp" alt="" aria-hidden="true"/><p>没有找到相关书籍</p><button className="button button-outline" onClick={()=>{setQuery('');setStatusFilter('全部');setRatingFilter('不限')}}>清除筛选</button></div>}
      </>}
    </main>
    <footer className="app-footer"><span>见字<span className="dot">。</span></span><button className="text-button" onClick={exportData}>导出备份</button></footer>

    {editor&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setEditor(null)}}><section className="editor-panel"><div className="editor-top"><span>{editor.kind}</span><button className="icon-button" onClick={()=>setEditor(null)} aria-label="关闭"><X size={18}/></button></div><input className="editor-title" placeholder="标题" value={editor.title} onChange={e=>{const n={...editor,title:e.target.value,updatedAt:new Date().toISOString()};setEditor(n);setEntry(n)}}/><div className="editor-kind"><select value={editor.kind} onChange={e=>{const n={...editor,kind:e.target.value as EntryKind};setEditor(n);setEntry(n)}}>{kinds.map(k=><option key={k}>{k}</option>)}</select><span>创建于 {dateLabel(editor.createdAt)}</span></div><textarea className="editor-body" placeholder="从这里开始……" value={editor.body} onChange={e=>{const n={...editor,body:e.target.value,updatedAt:new Date().toISOString()};setEditor(n);setEntry(n)}}/>{['歌词','摘抄'].includes(editor.kind)&&<input className="editor-source" placeholder="出处（可选）" value={editor.source||''} onChange={e=>{const n={...editor,source:e.target.value};setEditor(n);setEntry(n)}}/>}<div className="editor-bottom"><button className="button button-danger" onClick={()=>setPendingDelete({kind:'entry',id:editor.id})}><Trash2 size={14}/> 删除文字</button><span className="save-status">自动保存到本地</span><button className="button button-primary" onClick={()=>setEditor(null)}><Check size={14}/> 完成</button></div></section></div>}

    {bookEditor&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setBookEditor(null)}}><section className="editor-panel book-editor"><div className="editor-top"><span>书单 / 个人收藏</span><button className="icon-button" onClick={()=>setBookEditor(null)} aria-label="关闭"><X size={18}/></button></div><input className="editor-title" placeholder="书名" value={bookEditor.title} onChange={e=>{const n={...bookEditor,title:e.target.value};setBookEditor(n);setBook(n)}}/><input className="editor-source" placeholder="作者" value={bookEditor.author} onChange={e=>{const n={...bookEditor,author:e.target.value};setBookEditor(n);setBook(n)}}/><div className="book-editor-fields"><label>阅读状态<select value={bookEditor.status} onChange={e=>{const n={...bookEditor,status:e.target.value as Book['status']};setBookEditor(n);setBook(n)}}>{['想读','在读','已读','弃读'].map(s=><option key={s}>{s}</option>)}</select></label><label>评分<select value={bookEditor.rating??''} onChange={e=>{const n={...bookEditor,rating:e.target.value?Number(e.target.value):undefined};setBookEditor(n);setBook(n)}}><option value="">未评分</option>{Array.from({length:20},(_,i)=>(i+1)/2).reverse().map(n=><option key={n} value={n}>{n.toFixed(1)} / 10</option>)}</select></label></div><input className="editor-source" placeholder="关键词，用逗号分隔" value={bookEditor.tags.join('，')} onChange={e=>{const n={...bookEditor,tags:e.target.value.split(/[,，]/).map(x=>x.trim()).filter(Boolean)};setBookEditor(n);setBook(n)}}/><input className="editor-source" placeholder="人物 / CP，用逗号分隔" value={bookEditor.people.join('，')} onChange={e=>{const n={...bookEditor,people:e.target.value.split(/[,，]/).map(x=>x.trim()).filter(Boolean)};setBookEditor(n);setBook(n)}}/><textarea className="editor-body book-note-editor" placeholder="读后感……" value={bookEditor.note} onChange={e=>{const n={...bookEditor,note:e.target.value};setBookEditor(n);setBook(n)}}/><div className="editor-bottom"><button className="button button-danger" onClick={()=>setPendingDelete({kind:'book',id:bookEditor.id})}><Trash2 size={14}/> 删除书籍</button><span className="save-status">自动保存到本地</span><button className="button button-primary" onClick={()=>setBookEditor(null)}><Check size={14}/> 完成</button></div></section></div>}

    {adding&&<div className="overlay modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget){setAdding(false);setAddingToBoard(null)}}}><section className="modal"><div className="modal-head"><h2>{addingToBoard?'加入灵感墙':'留下一笔'}</h2><button className="icon-button" onClick={()=>{setAdding(false);setAddingToBoard(null)}}><X size={18}/></button></div>{addingToBoard&&<div className="existing-entry-list"><span className="field-label">选择已有文字</span>{data.entries.filter(e=>e.title||e.body).map(e=><button key={e.id} className={`existing-entry-option ${data.boards.find(b=>b.id===addingToBoard)?.entryIds.includes(e.id)?'is-added':''}`} onClick={()=>toggleBoard(e.id,addingToBoard)}><span><strong>{e.title||e.body.slice(0,32)}</strong><small>{e.kind}</small></span><span>{data.boards.find(b=>b.id===addingToBoard)?.entryIds.includes(e.id)?'已加入':'＋'}</span></button>)}</div>}<div className="modal-section-label">{addingToBoard?'或新建一条文字':'选择记录类型'}</div><div className="kind-grid">{kinds.map((k,i)=><button key={k} className="kind-tile" onClick={()=>startEntry(k)}><span className={`kind-symbol kind-symbol-${i}`}>{['✎','☼','文','♫','“ ”','✳','＋'][i]}</span><span>{k}</span></button>)}</div></section></div>}
    {newBoard&&<div className="overlay modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setNewBoard(false)}}><section className="modal"><div className="modal-head"><h2>新建灵感墙</h2><button className="icon-button" onClick={()=>setNewBoard(false)}><X size={18}/></button></div><form onSubmit={e=>{e.preventDefault();createBoard()}}><input className="form-input" value={newBoardTitle} onChange={e=>setNewBoardTitle(e.target.value)} placeholder="墙的名字" autoFocus/><div className="modal-actions"><button type="button" className="button button-outline" onClick={()=>setNewBoard(false)}>取消</button><button type="submit" className="button button-primary">创建</button></div></form></section></div>}
    {renameBoard&&<div className="overlay modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setRenameBoard(null)}}><section className="modal" role="dialog" aria-modal="true" aria-label="重命名灵感墙"><div className="modal-head"><h2>重命名灵感墙</h2><button className="icon-button" onClick={()=>setRenameBoard(null)} aria-label="关闭"><X size={18}/></button></div><form onSubmit={e=>{e.preventDefault();saveBoardName()}}><input className="form-input" autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setRenameBoard(null)}} aria-label="灵感墙名称"/><div className="modal-actions"><button type="button" className="button button-outline" onClick={()=>setRenameBoard(null)}>取消</button><button type="submit" className="button button-primary" disabled={!renameValue.trim()}>保存</button></div></form></section></div>}
    {pendingDelete&&<div className="overlay modal-overlay confirm-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setPendingDelete(null)}}>
      <section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="modal-head"><h2 id="delete-title">确认删除？</h2><button className="icon-button" onClick={()=>setPendingDelete(null)} aria-label="取消删除"><X size={18}/></button></div>
        <p>{pendingDelete.kind==='board'?'只删除这面灵感墙，墙上的原始文字会保留。':pendingDelete.kind==='book'?'这本书的评分、关键词和读后感也会删除。':'这条文字会从文字列表及关联的灵感墙中删除。'}</p>
        <div className="modal-actions"><button className="button button-outline" onClick={()=>setPendingDelete(null)}>取消</button><button className="button button-confirm-delete" onClick={confirmDelete}><Trash2 size={14}/> 确认删除</button></div>
      </section>
    </div>}
  </div>;
}
