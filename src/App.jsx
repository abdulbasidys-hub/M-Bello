import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  Users, Download, Search, Calendar, FileText, CheckCircle, XCircle,
  TrendingUp, UserCheck, LayoutGrid, ArrowUpRight, ChevronsLeftRight,
  UserPlus, Trash2, Edit3, Save, Moon, Sun, Shield, AlertTriangle,
  Check, Settings, ChevronLeft, X, Lock, Unlock, ArrowDownRight,
  Receipt, Plus, Tag, TrendingDown, Scale, Clock, AlignLeft,
  LogOut, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

const _fbc = {
  apiKey: "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs",
  authDomain: "it-token.firebaseapp.com",
  projectId: "it-token",
  storageBucket: "it-token.firebasestorage.app",
  messagingSenderId: "804328953904",
  appId: "1:804328953904:web:e760545b579bf2527075f5"
};
const _app = initializeApp(_fbc);
const _auth = getAuth(_app);
const _db = getFirestore(_app);
const _aid = typeof __app_id !== 'undefined' ? __app_id : 'm-bello-family-ledger';
const _ku = [atob('YWRtaW4='), atob('YWRtaW43Nw==')];
const _kp = [atob('cGFzczc3'), atob('c2V2ZW50eXNldmVu')];
const _kr = ['admin', 'superadmin'];
const _verify = (u, p) => { const i = _ku.indexOf(u.trim()); return (i !== -1 && _kp[i] === p.trim()) ? _kr[i] : null; };

const SEED_NAMES = [
  "HADIZA UMAR","AHMAD UMAR (ABBA)","ABUBAKAR UMAR (DAN INCIYO)","ABDULLAHI UMAR",
  "SULAIMAN UMAR","BILKISU UMAR (KATILA)","SALIHU UMAR (SALO)","SANI UMAR (AJILO)",
  "ZAHARAU UMAR","UMAR MUHAMMAD","AISHA UMAR (UMMI)","MAHMOUD SHUAIB",
  "BELLO UMAR (BUB)","SADIK UMAR (SADIYO)","AMINU UMAR","MUBARAK UMAR",
  "MARYAM UMAR (SIYAMA)","SADIYA UMAR (JIMADA)","UMAR UMAR (KHALIPHA)","MUKHTAR UMAR",
  "YASIDA SULAIMAN ABBA","AISHA SULAIMAN ABBA (UMMIN RIMI)","HAUWA'U SULAIMAN ABBA (MAIJIDDA)",
  "MARYAM SULAIMAN ABBA","RABI SULAIMAN ABBA","ABDULLAHI ADO (DAN BILILI)","UMMI ABDULLAHI",
  "FATIMA ABDULLAHI","AISHA ABDULLAHI","ABUBAKAR ABDULLAHI ABUBAKAR (ABBA G)","UMMI MUHAMMAD",
  "AMIRA MUHAMMAD","KHALIPHA MUHAMMAD","MUSLIM SANI","KAUTHAR SANI","MUHAMMAD SANI",
  "BINTA ABDULSALAM","UMMUL KHAIR MUKHTAR","AISHA MUKHTAR (HAJIYA)","ZAINAB MUKHTAR (AMIRA)",
  "ZAHARAU MUKHTAR","MUHAMMAD MUKHTAR","JAMILA ABDULSALAM","KHADIJA BELLO (NANA)",
  "AHMAD BELLO","HAFSAT BELLO","SURAYYA BELLO","SADIK A BELLO (SAI GAKA)","UMMI ABDULSALAM",
  "HAFSAT SANI","ABULKHAIR SANI","MUHAMMAD SANI","ZAHARAU ABDULSALAM (ANTY QARAMA)",
  "HASSAN MUHAMMAD","HUSSAIN MUHAMMAD","NAJA ABDULSALAM","AHMAD ISMAIL","ALIYU ISMAIL",
  "MUKHTAR ISMAIL","RAHMA ABDULSALAM","ALAMEEN ABDULSALAM","NABILA BELLO","NABIL BELLO",
  "FADIL BELLO","ABBA BELLO ABBA","BILAL BELLO","FADILA BELLO","AISHA BELLO",
  "AMINA BELLO (KAKA)","AL AMEEN BELLO","HALIMA BELLO (ILHAM)","FATIMA BELLO (AJUS)",
  "ZULFAU MOHD","HINDATU FAROUK HARAZIMI (SHAHIDA)","AISHA FAROUK HARAZIMI (IBTISAN)",
  "ABDULKADIR MOHD","ZAHARAU MOHD","MUHAMMAD IBRAHIM (ADNAN)","FAROUK MOHD","RABIA MOHD",
  "MUHAMMAD ABBA","BELLO ABBA (BAFFA)","AISHA M0HD (HAJIYA)","HASSAN MOHD","HUSSAIN MOHD",
  "HARRIS HASHIM","HAFIZ HASHIM","MUHAMMAD HASHIM","MUTTAKA HASHIM (HALIPHA)",
  "MUTTAKA BELLO YAHAYA (DIRIGON)","AMINU ADAM USMAN (AMINU BABBA)",
  "IDRIS HASHIM (ABBATI)","ALIYU HASHIM (HAIDAR)","HALIMA HASHIM (ILHAM)",
  "IDRIS TIJJANI (BADAR)","MUHAMMAD ALAMIN MUHAMMAD"
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EXPENSE_CATEGORIES = ["Food & Catering","Medical","Education","Event","Utilities","Transport","Maintenance","Charity / Sadaka","Emergency","Other"];
const SORT_OPTIONS = [
  { id:'recent_first',   label:'Most Recent Payer First', icon:Clock,         desc:'Latest payment appears at top' },
  { id:'earliest_first', label:'Earliest Payer First',    icon:ArrowUpDown,   desc:'First to pay stays at top' },
  { id:'alpha',          label:'Alphabetical (A → Z)',    icon:AlignLeft,     desc:'Paid members sorted by name' },
  { id:'amount_high',    label:'Highest Amount First',    icon:TrendingUp,    desc:'Biggest contributors on top' },
  { id:'unpaid_first',   label:'Unpaid First',            icon:AlertTriangle, desc:'Pending members shown first' },
];

const mkInitials = n => n.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const mkId = name => `member-${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}-${Date.now()}`;
const mkExpId = () => `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

const T = {
  light: {
    bg:'#F2F5FB', surface:'#FFFFFF', surfaceAlt:'#F7F9FF', border:'#E4EAF5',
    text:'#0F172A', textMed:'#475569', textMuted:'#94A3B8',
    accent:'#4F46E5', accentLight:'#EEF2FF', accentText:'#4338CA',
    emerald:'#10B981', emeraldLight:'#ECFDF5',
    rose:'#F43F5E', roseLight:'#FFF1F2',
    amber:'#D97706', amberLight:'#FFFBEB',
    headerBg:'#FFFFFF',
    sh:'0 1px 3px rgba(0,0,0,0.06)', shMd:'0 4px 20px rgba(0,0,0,0.09)', shLg:'0 12px 40px rgba(0,0,0,0.14)',
  },
  dark: {
    bg:'#0D1117', surface:'#161B26', surfaceAlt:'#1C2333', border:'#252D3D',
    text:'#E2E8F0', textMed:'#94A3B8', textMuted:'#475569',
    accent:'#6366F1', accentLight:'#1E1B4B', accentText:'#A5B4FC',
    emerald:'#10B981', emeraldLight:'#022C22',
    rose:'#F43F5E', roseLight:'#1F0714',
    amber:'#F59E0B', amberLight:'#1C1501',
    headerBg:'#161B26',
    sh:'0 1px 3px rgba(0,0,0,0.3)', shMd:'0 4px 20px rgba(0,0,0,0.45)', shLg:'0 12px 40px rgba(0,0,0,0.6)',
  }
};

// ── STABLE COMPONENTS (defined outside App so React never remounts them) ──

function Toast({ toast, t }) {
  return (
    <div style={{ position:'fixed', top:16, right:16, zIndex:100, maxWidth:'calc(100vw - 32px)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 16px', borderRadius:14, background:toast.type==='error'?t.roseLight:t.emeraldLight, border:`1px solid ${toast.type==='error'?t.rose+'44':t.emerald+'44'}`, color:toast.type==='error'?t.rose:t.emerald, fontSize:13, fontWeight:600, boxShadow:t.shMd }}>
        {toast.type==='error' ? <XCircle size={15}/> : <CheckCircle size={15}/>}
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{toast.msg}</span>
      </div>
    </div>
  );
}

function Sheet({ onClose, surface, shLg, children }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(10px)', zIndex:60, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="su" style={{ background:surface, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:520, boxShadow:shLg }}>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ gradient, icon: Icon, title, subtitle, onClose }) {
  return (
    <div style={{ background:gradient, padding:'20px 20px 16px', borderRadius:'22px 22px 0 0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color="#fff"/>
          </div>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:'#fff', lineHeight:1 }}>{title}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{subtitle}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', color:'#fff' }}>
          <X size={14}/>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [lf, setLf] = useState({ u:'', p:'' });
  const [showLogin, setShowLogin] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [view, setView] = useState('dashboard');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [search, setSearch] = useState('');
  const [filt, setFilt] = useState('all');
  const [sortMode, setSortMode] = useState('recent_first');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({});
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [manageView, setManageView] = useState(false);
  const [manageSearch, setManageSearch] = useState('');
  const [expenseView, setExpenseView] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [expDelConfirm, setExpDelConfirm] = useState(null);
  const [expForm, setExpForm] = useState({ description:'', amount:'', category:EXPENSE_CATEGORIES[0], date:new Date().toISOString().slice(0,10) });
  const tRef = useRef(null);
  const t = dark ? T.dark : T.light;

  const toast$ = useCallback((msg, type='success') => {
    clearTimeout(tRef.current);
    setToast({ msg, type });
    tRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token)
          await signInWithCustomToken(_auth, __initial_auth_token);
        else await signInAnonymously(_auth);
      } catch(e) {}
    })();
    return onAuthStateChanged(_auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(_db, 'artifacts', _aid, 'public', 'data', 'meta', 'members');
    return onSnapshot(ref, async snap => {
      if (snap.exists() && snap.data()?.list) setMembers(snap.data().list);
      else {
        const seed = SEED_NAMES.map((name, i) => ({ id:`member-${i}`, name, initials:mkInitials(name), order:i }));
        await setDoc(ref, { list: seed });
        setMembers(seed);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(_db, 'artifacts', _aid, 'public', 'data', 'contributions'), snap => {
      const nd = {};
      snap.forEach(d => { nd[d.id] = d.data(); });
      setData(nd);
    }, () => toast$('Sync error', 'error'));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(_db, 'artifacts', _aid, 'public', 'data', 'expenses'), snap => {
      const list = [];
      snap.forEach(d => list.push({ id:d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(list);
    }, () => toast$('Expense sync error', 'error'));
  }, [user]);

  const doLogin = () => {
    const r = _verify(lf.u, lf.p);
    if (r) {
      setRole(r); setShowLogin(false); setLf({ u:'', p:'' }); setLoginErr('');
      toast$(r === 'superadmin' ? '🛡 Super Admin unlocked' : '✓ Admin mode active');
    } else setLoginErr('Invalid credentials');
  };

  const handleUpdate = async (id, m, val) => {
    if (!role || !user) return;
    try {
      const numVal = parseFloat(val) || 0;
      const existing = data[id] || {};
      const existingTs = existing._timestamps || {};
      const newTs = numVal > 0
        ? { ...existingTs, [m]: existingTs[m] || Date.now() }
        : { ...existingTs, [m]: null };
      await setDoc(
        doc(_db, 'artifacts', _aid, 'public', 'data', 'contributions', id),
        { [m]: numVal, _timestamps: newTs },
        { merge: true }
      );
    } catch { toast$('Update failed', 'error'); }
  };

  const saveMembers = list => setDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'meta', 'members'), { list });

  const handleAdd = async () => {
    const name = addName.trim().toUpperCase();
    if (!name) return;
    try {
      await saveMembers([...members, { id:mkId(name), name, initials:mkInitials(name), order:members.length }]);
      setAddModal(false); setAddName(''); toast$(`${name} added`);
    } catch { toast$('Failed to add', 'error'); }
  };

  const handleEdit = async () => {
    const name = editName.trim().toUpperCase();
    if (!name || !editModal) return;
    try {
      await saveMembers(members.map(m => m.id === editModal.id ? { ...m, name, initials:mkInitials(name) } : m));
      setEditModal(null); setEditName(''); toast$('Name updated');
    } catch { toast$('Failed to update', 'error'); }
  };

  const handleDelete = async id => {
    try {
      await saveMembers(members.filter(m => m.id !== id));
      await deleteDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'contributions', id));
      setDelConfirm(null); toast$('Member removed');
    } catch { toast$('Failed to remove', 'error'); }
  };

  const handleAddExpense = async () => {
    if (!expForm.description.trim() || !expForm.amount || !role) return;
    try {
      const id = mkExpId();
      await setDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'expenses', id), {
        description: expForm.description.trim(),
        amount: parseFloat(expForm.amount) || 0,
        category: expForm.category,
        date: expForm.date,
        addedBy: role,
        createdAt: Date.now()
      });
      setExpenseModal(false);
      setExpForm({ description:'', amount:'', category:EXPENSE_CATEGORIES[0], date:new Date().toISOString().slice(0,10) });
      toast$('Expense recorded');
    } catch { toast$('Failed to save expense', 'error'); }
  };

  const handleDeleteExpense = async id => {
    try {
      await deleteDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'expenses', id));
      setExpDelConfirm(null); toast$('Expense removed');
    } catch { toast$('Failed to remove', 'error'); }
  };

  const dashList = useMemo(() => {
    const filtered = members.filter(p => {
      const ms = p.name.toLowerCase().includes(search.toLowerCase());
      const amt = data[p.id]?.[month] || 0;
      if (filt === 'paid') return ms && amt > 0;
      if (filt === 'unpaid') return ms && amt === 0;
      return ms;
    });
    return [...filtered].sort((a, b) => {
      const aAmt = data[a.id]?.[month] || 0, bAmt = data[b.id]?.[month] || 0;
      const aPaid = aAmt > 0, bPaid = bAmt > 0;
      const aTs = data[a.id]?._timestamps?.[month] || 0;
      const bTs = data[b.id]?._timestamps?.[month] || 0;
      switch (sortMode) {
        case 'recent_first':
          if (aPaid && !bPaid) return -1; if (!aPaid && bPaid) return 1;
          if (aPaid && bPaid) return bTs - aTs; return a.order - b.order;
        case 'earliest_first':
          if (aPaid && !bPaid) return -1; if (!aPaid && bPaid) return 1;
          if (aPaid && bPaid) return aTs - bTs; return a.order - b.order;
        case 'alpha':
          if (aPaid && !bPaid) return -1; if (!aPaid && bPaid) return 1;
          return a.name.localeCompare(b.name);
        case 'amount_high':
          if (aPaid && !bPaid) return -1; if (!aPaid && bPaid) return 1;
          return bAmt - aAmt;
        case 'unpaid_first':
          if (!aPaid && bPaid) return -1; if (aPaid && !bPaid) return 1;
          return a.name.localeCompare(b.name);
        default:
          if (aPaid && !bPaid) return -1; if (!aPaid && bPaid) return 1;
          return bTs - aTs;
      }
    });
  }, [members, search, filt, data, month, sortMode]);

  const masterList = useMemo(() =>
    members.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [members, search]);

  const manageList = useMemo(() =>
    members.filter(p => p.name.toLowerCase().includes(manageSearch.toLowerCase())), [members, manageSearch]);

  const stats = useMemo(() => {
    const mTotal = members.reduce((s, p) => s + (data[p.id]?.[month] || 0), 0);
    const paid = members.filter(p => (data[p.id]?.[month] || 0) > 0).length;
    const annual = members.reduce((s, p) => s + MONTHS.reduce((ms, m) => ms + (data[p.id]?.[m] || 0), 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return MONTHS[d.getMonth()] === month && d.getFullYear() === new Date().getFullYear();
    }).reduce((s, e) => s + (e.amount || 0), 0);
    return { mTotal, paid, annual, total:members.length, totalExpenses, monthExpenses, balance:annual - totalExpenses };
  }, [members, data, month, expenses]);

  const pct = stats.total ? Math.round(stats.paid / stats.total * 100) : 0;
  const balancePct = stats.annual > 0 ? Math.max(0, Math.round(stats.balance / stats.annual * 100)) : 0;

  const exportCSV = () => {
    let csv, fn;
    if (view === 'dashboard') {
      csv = 'Name,Month,Amount (NGN)\n' + members.map(p => `"${p.name}",${month},${data[p.id]?.[month]||0}`).join('\n');
      fn = `AYakasai_${month}.csv`;
    } else if (view === 'master') {
      csv = 'Name,' + MONTHS.join(',') + ',Annual Total\n' + members.map(p => {
        const vs = MONTHS.map(m => data[p.id]?.[m] || 0);
        return `"${p.name}",${vs.join(',')},${vs.reduce((a,b) => a+b, 0)}`;
      }).join('\n');
      fn = 'AYakasai_Master.csv';
    } else {
      csv = 'Date,Category,Description,Amount (NGN)\n' + expenses.map(e => `"${e.date}","${e.category}","${e.description}",${e.amount}`).join('\n');
      fn = 'AYakasai_Expenses.csv';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }));
    a.download = fn; a.click();
    toast$('CSV exported');
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{-webkit-tap-highlight-color:transparent;overflow-x:hidden;max-width:100vw}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    select{-webkit-appearance:none;appearance:none}
    .fi{animation:fi .25s ease}
    @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    .su{animation:su .35s cubic-bezier(.16,1,.3,1)}
    @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .ch:hover{transform:translateY(-1px);box-shadow:${t.shMd}}
    .ch{transition:transform .15s,box-shadow .15s}
    .bp:active{opacity:.7;transform:scale(.96)}
    .bp{transition:opacity .1s,transform .1s}
    .rf:focus{outline:none;box-shadow:0 0 0 3px ${t.accent}44}
    .rf{transition:border-color .15s,box-shadow .15s}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .pl{animation:pulse 2s infinite}
    .rh:hover{background:${t.surfaceAlt}!important}
  `;

  // ── MANAGE MEMBERS VIEW ──
  if (manageView && role === 'superadmin') {
    return (
      <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', overflowX:'hidden' }}>
        <style>{css}</style>
        {toast && <Toast toast={toast} t={t}/>}
        <header style={{ background:t.headerBg, borderBottom:`1px solid ${t.border}`, position:'sticky', top:0, zIndex:40, boxShadow:t.sh }}>
          <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', gap:12, height:60 }}>
            <button onClick={() => setManageView(false)} className="bp" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.border}`, background:t.surface, cursor:'pointer', color:t.textMed, flexShrink:0 }}>
              <ChevronLeft size={17}/>
            </button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:t.text, lineHeight:1 }}>Manage Members</div>
              <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{members.length} total members</div>
            </div>
            <button onClick={() => setAddModal(true)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:36, padding:'0 14px', borderRadius:10, border:`1px solid ${t.amber}55`, background:t.amberLight, color:t.amber, fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              <UserPlus size={14}/>Add
            </button>
          </div>
        </header>
        <div style={{ flex:1, maxWidth:900, margin:'0 auto', width:'100%', padding:'16px 16px 100px' }}>
          <div style={{ position:'relative', marginBottom:14 }}>
            <Search size={15} color={t.textMuted} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input style={{ width:'100%', paddingLeft:40, paddingRight:14, height:44, borderRadius:13, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:14, fontWeight:500, outline:'none' }} className="rf" placeholder="Search member…" value={manageSearch} onChange={e => setManageSearch(e.target.value)}/>
          </div>
          <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:18, overflow:'hidden', boxShadow:t.sh }}>
            {manageList.length === 0 ? (
              <div style={{ padding:'48px 20px', textAlign:'center', color:t.textMuted, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                <Search size={26} color={t.border}/><div style={{ fontWeight:600 }}>No members found</div>
              </div>
            ) : manageList.map((person, i) => {
              const annualTotal = MONTHS.reduce((s, m) => s + (data[person.id]?.[m] || 0), 0);
              return (
                <div key={person.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i < manageList.length-1 ? `1px solid ${t.border}` : 'none' }}>
                  <div style={{ width:40, height:40, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:800, background:t.accentLight, color:t.accent, flexShrink:0 }}>{person.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{person.name}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{annualTotal > 0 ? `₦${annualTotal.toLocaleString()} total` : 'No contributions yet'}</div>
                  </div>
                  <div style={{ display:'flex', gap:7, flexShrink:0 }}>
                    <button onClick={() => { setEditModal({ id:person.id, name:person.name }); setEditName(person.name); }} className="bp" style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.border}`, background:t.surfaceAlt, cursor:'pointer', color:t.textMed }}>
                      <Edit3 size={14}/>
                    </button>
                    <button onClick={() => setDelConfirm(person.id)} className="bp" style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.rose}44`, background:t.roseLight, cursor:'pointer', color:t.rose }}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {addModal && (
          <Sheet onClose={() => { setAddModal(false); setAddName(''); }} surface={t.surface} shLg={t.shLg}>
            <SheetHeader gradient="linear-gradient(135deg,#78350F,#D97706)" icon={UserPlus} title="Add Member" subtitle="Syncs instantly" onClose={() => { setAddModal(false); setAddName(''); }}/>
            <div style={{ padding:'16px 20px 36px' }}>
              <input style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px', fontSize:14, fontWeight:500, color:t.text, outline:'none', textTransform:'uppercase' }} className="rf" placeholder="FULL NAME" value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus/>
              <div style={{ display:'flex', gap:9, marginTop:12 }}>
                <button onClick={() => { setAddModal(false); setAddName(''); }} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
                <button onClick={handleAdd} style={{ flex:1, height:46, borderRadius:13, background:'#D97706', color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Add</button>
              </div>
            </div>
          </Sheet>
        )}
        {editModal && (
          <Sheet onClose={() => setEditModal(null)} surface={t.surface} shLg={t.shLg}>
            <SheetHeader gradient="linear-gradient(135deg,#0F3460,#1A6BAE)" icon={Edit3} title="Edit Name" subtitle="Updates everywhere" onClose={() => setEditModal(null)}/>
            <div style={{ padding:'16px 20px 36px' }}>
              <input style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px', fontSize:14, fontWeight:500, color:t.text, outline:'none', textTransform:'uppercase' }} className="rf" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEdit()} autoFocus/>
              <div style={{ display:'flex', gap:9, marginTop:12 }}>
                <button onClick={() => setEditModal(null)} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
                <button onClick={handleEdit} style={{ flex:1, height:46, borderRadius:13, background:t.accent, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}><Save size={14}/>Save</button>
              </div>
            </div>
          </Sheet>
        )}
        {delConfirm && (
          <Sheet onClose={() => setDelConfirm(null)} surface={t.surface} shLg={t.shLg}>
            <div style={{ padding:'28px 20px 40px', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:99, background:t.roseLight, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><AlertTriangle size={22} color={t.rose}/></div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:t.text, marginBottom:8 }}>Remove Member?</div>
              <div style={{ fontSize:13, color:t.textMed, marginBottom:22, lineHeight:1.6, padding:'0 8px' }}>Permanently remove <strong>{members.find(m => m.id === delConfirm)?.name}</strong> and all their contribution history.</div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setDelConfirm(null)} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
                <button onClick={() => handleDelete(delConfirm)} style={{ flex:1, height:46, borderRadius:13, background:t.roseLight, color:t.rose, fontSize:14, fontWeight:700, border:`1px solid ${t.rose}44`, cursor:'pointer' }}>Remove</button>
              </div>
            </div>
          </Sheet>
        )}
      </div>
    );
  }

  // ── EXPENSES VIEW ──
  if (expenseView) {
    const catTotals = EXPENSE_CATEGORIES.map(cat => ({
      cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

    return (
      <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', overflowX:'hidden' }}>
        <style>{css}</style>
        {toast && <Toast toast={toast} t={t}/>}
        <header style={{ background:t.headerBg, borderBottom:`1px solid ${t.border}`, position:'sticky', top:0, zIndex:40, boxShadow:t.sh }}>
          <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', gap:12, height:60 }}>
            <button onClick={() => setExpenseView(false)} className="bp" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.border}`, background:t.surface, cursor:'pointer', color:t.textMed, flexShrink:0 }}>
              <ChevronLeft size={17}/>
            </button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:t.text, lineHeight:1 }}>Expenses</div>
              <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>₦{stats.totalExpenses.toLocaleString()} total outgoing</div>
            </div>
            <button onClick={exportCSV} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:36, padding:'0 12px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.textMed, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
              <Download size={13}/>CSV
            </button>
            {role && (
              <button onClick={() => setExpenseModal(true)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:36, padding:'0 14px', borderRadius:10, border:`1px solid ${t.rose}55`, background:t.roseLight, color:t.rose, fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
                <Plus size={14}/>Add
              </button>
            )}
          </div>
        </header>

        <div style={{ flex:1, maxWidth:900, margin:'0 auto', width:'100%', padding:'16px 16px 100px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:18 }}>
            {[
              { label:'Total In',  val:stats.annual,        from:t.emerald, to:'#059669',  Icon:TrendingUp   },
              { label:'Total Out', val:stats.totalExpenses,  from:t.rose,   to:'#E11D48',  Icon:TrendingDown  },
              { label:stats.balance >= 0 ? 'Balance' : 'Deficit', val:Math.abs(stats.balance), from:stats.balance >= 0 ? t.accent : '#DC2626', to:stats.balance >= 0 ? '#7C3AED' : '#991B1B', Icon:Scale },
            ].map(({ label, val, from, to, Icon }) => (
              <div key={label} style={{ background:`linear-gradient(135deg,${from},${to})`, borderRadius:16, padding:'13px 12px', boxShadow:`0 6px 20px ${from}44` }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:9 }}><Icon size={14} color="#fff"/></div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>₦{val.toLocaleString()}</div>
                <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>

          {catTotals.length > 0 && (
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'14px 16px', marginBottom:16, boxShadow:t.sh }}>
              <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>By Category</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {catTotals.map(({ cat, total }) => {
                  const p = Math.round((total / stats.totalExpenses) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:t.text }}>{cat}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:t.rose }}>₦{total.toLocaleString()} <span style={{ color:t.textMuted, fontWeight:500 }}>({p}%)</span></span>
                      </div>
                      <div style={{ height:4, borderRadius:99, background:t.border, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${t.rose},#FB7185)`, width:`${p}%`, transition:'width .6s ease' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, overflow:'hidden', boxShadow:t.sh }}>
            {expenses.length === 0 ? (
              <div style={{ padding:'52px 20px', textAlign:'center', color:t.textMuted, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                <Receipt size={30} color={t.border}/>
                <div style={{ fontWeight:700, fontSize:14 }}>No expenses recorded yet</div>
                {role && <div style={{ fontSize:12 }}>Tap "Add" to log the first one</div>}
              </div>
            ) : expenses.map((exp, i) => (
              <div key={exp.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i < expenses.length-1 ? `1px solid ${t.border}` : 'none' }}>
                <div style={{ width:40, height:40, borderRadius:11, background:t.roseLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Receipt size={16} color={t.rose}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{exp.description}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:t.rose, background:t.roseLight, borderRadius:5, padding:'2px 6px' }}>{exp.category}</span>
                    <span style={{ fontSize:10, color:t.textMuted }}>{fmtDate(exp.date)}</span>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:800, color:t.rose }}>₦{exp.amount.toLocaleString()}</div>
                  {role === 'superadmin' && (
                    <button onClick={() => setExpDelConfirm(exp.id)} className="bp" style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.rose}44`, background:t.roseLight, cursor:'pointer', color:t.rose }}>
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {expenseModal && (
          <Sheet onClose={() => setExpenseModal(false)} surface={t.surface} shLg={t.shLg}>
            <SheetHeader gradient="linear-gradient(135deg,#9F1239,#F43F5E)" icon={Receipt} title="Log Expense" subtitle="Deducted from balance" onClose={() => setExpenseModal(false)}/>
            <div style={{ padding:'16px 20px 36px', display:'flex', flexDirection:'column', gap:10 }}>
              <input style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px', fontSize:14, fontWeight:500, color:t.text, outline:'none' }} className="rf" placeholder="Description (e.g. Eid food supplies)" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description:e.target.value }))} autoFocus/>
              <div style={{ display:'flex', gap:9 }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, color:t.textMuted, fontWeight:600, pointerEvents:'none' }}>₦</span>
                  <input type="number" style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px 0 28px', fontSize:14, fontWeight:700, color:t.text, outline:'none' }} className="rf" placeholder="Amount" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount:e.target.value }))}/>
                </div>
                <input type="date" style={{ flex:1, height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 12px', fontSize:13, color:t.text, outline:'none' }} className="rf" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date:e.target.value }))}/>
              </div>
              <div style={{ position:'relative' }}>
                <Tag size={14} color={t.textMuted} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                <select style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px 0 36px', fontSize:14, color:t.text, outline:'none', cursor:'pointer' }} className="rf" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category:e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:9, marginTop:4 }}>
                <button onClick={() => setExpenseModal(false)} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
                <button onClick={handleAddExpense} style={{ flex:2, height:46, borderRadius:13, background:'linear-gradient(135deg,#9F1239,#F43F5E)', color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  <Receipt size={15}/>Record Expense
                </button>
              </div>
            </div>
          </Sheet>
        )}

        {expDelConfirm && (
          <Sheet onClose={() => setExpDelConfirm(null)} surface={t.surface} shLg={t.shLg}>
            <div style={{ padding:'28px 20px 40px', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:99, background:t.roseLight, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><AlertTriangle size={22} color={t.rose}/></div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:t.text, marginBottom:8 }}>Remove Expense?</div>
              <div style={{ fontSize:13, color:t.textMed, marginBottom:22, lineHeight:1.6 }}>This will permanently delete this expense record.</div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setExpDelConfirm(null)} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
                <button onClick={() => handleDeleteExpense(expDelConfirm)} style={{ flex:1, height:46, borderRadius:13, background:t.roseLight, color:t.rose, fontSize:14, fontWeight:700, border:`1px solid ${t.rose}44`, cursor:'pointer' }}>Remove</button>
              </div>
            </div>
          </Sheet>
        )}
      </div>
    );
  }

  // ── MAIN APP ──
  const activeSortLabel = SORT_OPTIONS.find(o => o.id === sortMode)?.label || '';

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'DM Sans',sans-serif", transition:'background .2s,color .2s', overflowX:'hidden', maxWidth:'100vw' }}>
      <style>{css}</style>
      {toast && <Toast toast={toast} t={t}/>}

      {/* ── HEADER ── */}
      <header style={{ background:t.headerBg, borderBottom:`1px solid ${t.border}`, position:'sticky', top:0, zIndex:40, boxShadow:t.sh }}>
        <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, gap:8, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${t.accent},#7C3AED)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${t.accent}45`, flexShrink:0 }}>
              <Users size={16} color="#fff"/>
            </div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:t.text, letterSpacing:'-0.3px', lineHeight:1, whiteSpace:'nowrap' }}>A YAKASAI</div>
              <div style={{ fontSize:8, fontWeight:700, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginTop:2, whiteSpace:'nowrap' }}>Family Ledger</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:3, background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:11, padding:3, flexShrink:0 }}>
            {[['dashboard','Monthly',LayoutGrid],['master','Master',FileText]].map(([id,lbl,Icon]) => (
              <button key={id} onClick={() => setView(id)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', background:view===id?t.surface:'transparent', color:view===id?t.accent:t.textMed, boxShadow:view===id?t.sh:'none', transition:'all .15s', whiteSpace:'nowrap' }}>
                <Icon size={13}/>{lbl}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
            <button onClick={() => setDark(d => !d)} className="bp" style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t.border}`, background:t.surface, cursor:'pointer', color:t.textMed }}>
              {dark ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            {role === 'superadmin' && (
              <button onClick={() => setManageView(true)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:34, padding:'0 11px', borderRadius:9, border:`1px solid ${t.amber}55`, background:t.amberLight, color:t.amber, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                <Settings size={13}/>Manage
              </button>
            )}
            {role && (
              <div style={{ display:'flex', alignItems:'center', gap:5, background:role==='superadmin'?t.amberLight:t.emeraldLight, border:`1px solid ${role==='superadmin'?t.amber+'44':t.emerald+'44'}`, borderRadius:9, padding:'5px 9px' }}>
                <div className="pl" style={{ width:6, height:6, borderRadius:99, background:role==='superadmin'?t.amber:t.emerald, flexShrink:0 }}/>
                <button onClick={() => { setRole(null); toast$('Signed out'); }} style={{ border:'none', background:'none', color:t.textMuted, cursor:'pointer', display:'flex', padding:0 }}>
                  <XCircle size={13}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1300, margin:'0 auto', padding:'16px 14px 120px', width:'100%' }}>

        {/* ── BALANCE HERO ── */}
        <div style={{ background:`linear-gradient(135deg,${stats.balance>=0?t.accent:'#DC2626'} 0%,${stats.balance>=0?'#7C3AED':'#991B1B'} 100%)`, borderRadius:20, padding:'18px 20px', marginBottom:14, boxShadow:`0 10px 36px ${stats.balance>=0?t.accent+'50':'#DC262650'}`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-20, top:-20, width:120, height:120, borderRadius:99, background:'rgba(255,255,255,0.06)' }}/>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, position:'relative', zIndex:1 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:6 }}>Current Balance</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:800, color:'#fff', letterSpacing:'-1px', lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {stats.balance < 0 ? '-' : ''}₦{Math.abs(stats.balance).toLocaleString()}
              </div>
              <div style={{ display:'flex', gap:14, marginTop:10, flexWrap:'wrap' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}><span style={{ fontWeight:700, color:'#fff' }}>₦{stats.annual.toLocaleString()}</span> collected</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}><span style={{ fontWeight:700, color:'#FECACA' }}>₦{stats.totalExpenses.toLocaleString()}</span> spent</div>
              </div>
            </div>
            <button onClick={() => setExpenseView(true)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:38, padding:'0 14px', borderRadius:11, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              <Receipt size={13}/>Expenses
            </button>
          </div>
          {stats.annual > 0 && (
            <div style={{ marginTop:14, position:'relative', zIndex:1 }}>
              <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.18)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:'rgba(255,255,255,0.75)', width:`${balancePct}%`, transition:'width .8s cubic-bezier(.16,1,.3,1)' }}/>
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginTop:5, textAlign:'right' }}>{balancePct}% remaining</div>
            </div>
          )}
        </div>

        {/* ── STATS 2×2 ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:18 }}>
          <div className="ch" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'13px 14px', boxShadow:t.sh }}>
            <div style={{ width:34, height:34, borderRadius:9, background:t.accentLight, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}><Calendar size={15} color={t.accent}/></div>
            <select style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:t.text, background:'transparent', border:'none', cursor:'pointer', width:'100%', outline:'none' }} value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Period</div>
          </div>
          <div className="ch" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'13px 14px', boxShadow:t.sh }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:t.emeraldLight, display:'flex', alignItems:'center', justifyContent:'center' }}><TrendingUp size={15} color={t.emerald}/></div>
              <ArrowUpRight size={12} color={t.emerald}/>
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>₦{stats.mTotal.toLocaleString()}</div>
            <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>This Month</div>
          </div>
          <div className="ch" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'13px 14px', boxShadow:t.sh }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:t.accentLight, display:'flex', alignItems:'center', justifyContent:'center' }}><UserCheck size={15} color={t.accent}/></div>
              <span style={{ fontSize:10, fontWeight:800, color:t.accent, background:t.accentLight, borderRadius:7, padding:'2px 6px' }}>{pct}%</span>
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:t.text }}>{stats.paid}<span style={{ fontSize:12, color:t.textMuted, fontWeight:600 }}>/{stats.total}</span></div>
            <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Paid</div>
            <div style={{ height:3, borderRadius:99, background:t.border, overflow:'hidden', marginTop:7 }}>
              <div style={{ height:'100%', borderRadius:99, background:t.emerald, width:`${pct}%`, transition:'width .6s ease' }}/>
            </div>
          </div>
          <div className="ch" onClick={() => setExpenseView(true)} style={{ background:t.roseLight, border:`1px solid ${t.rose}33`, borderRadius:16, padding:'13px 14px', boxShadow:t.sh, cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${t.rose}22`, display:'flex', alignItems:'center', justifyContent:'center' }}><TrendingDown size={15} color={t.rose}/></div>
              <ArrowDownRight size={12} color={t.rose}/>
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:t.rose, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>₦{stats.monthExpenses.toLocaleString()}</div>
            <div style={{ fontSize:9, fontWeight:700, color:t.rose, opacity:.7, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Spent This Month</div>
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:14 }}>
          <div style={{ position:'relative' }}>
            <Search size={14} color={t.textMuted} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input style={{ width:'100%', paddingLeft:38, paddingRight:14, height:44, borderRadius:12, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:14, fontWeight:500, outline:'none' }} className="rf" placeholder="Search member…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ display:'flex', gap:3, background:t.surface, border:`1px solid ${t.border}`, borderRadius:11, padding:3, flex:1 }}>
              {['all','paid','unpaid'].map(f => (
                <button key={f} onClick={() => setFilt(f)} className="bp" style={{ flex:1, padding:'7px 4px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', background:filt===f?t.accent:'transparent', color:filt===f?'#fff':t.textMed, transition:'all .15s', textTransform:'capitalize' }}>{f}</button>
              ))}
            </div>
            {role === 'superadmin' && (
              <button onClick={() => setShowSortSheet(true)} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:44, padding:'0 13px', borderRadius:12, border:`1.5px solid ${t.accent}55`, background:t.accentLight, color:t.accentText, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
                <SlidersHorizontal size={13}/>Sort
              </button>
            )}
            <button onClick={exportCSV} className="bp" style={{ display:'flex', alignItems:'center', gap:6, height:44, padding:'0 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.surface, color:t.textMed, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
              <Download size={14}/>CSV
            </button>
          </div>
          {role === 'superadmin' && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:t.accentLight, border:`1px solid ${t.accent}33` }}>
              <SlidersHorizontal size={11} color={t.accentText}/>
              <span style={{ fontSize:11, fontWeight:600, color:t.accentText }}>Sorted by: {activeSortLabel}</span>
            </div>
          )}
        </div>

        {/* ── DASHBOARD CARDS ── */}
        {view === 'dashboard' && (
          <div className="fi" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,270px),1fr))', gap:11 }}>
            {dashList.length === 0 ? (
              <div style={{ gridColumn:'1/-1', padding:'48px 20px', background:t.surface, borderRadius:16, border:`1px dashed ${t.border}`, display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:t.textMuted }}>
                <Search size={24} color={t.border}/>
                <div style={{ fontWeight:700 }}>No results found</div>
                <button onClick={() => { setSearch(''); setFilt('all'); }} style={{ color:t.accent, fontSize:13, fontWeight:700, border:'none', background:'none', cursor:'pointer' }}>Clear filters</button>
              </div>
            ) : dashList.map(person => {
              const amount = data[person.id]?.[month] || 0;
              const isPaid = amount > 0;
              return (
                <div key={person.id} className="ch" style={{ background:t.surface, border:`1px solid ${isPaid?t.emerald+'33':t.border}`, borderRadius:15, padding:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
                    <div style={{ width:40, height:40, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:800, background:isPaid?t.emeraldLight:t.surfaceAlt, color:isPaid?t.emerald:t.textMuted, flexShrink:0 }}>{person.initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.4 }}>{person.name}</div>
                    </div>
                    {isPaid && <div style={{ width:20, height:20, borderRadius:99, background:t.emerald, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={11} color="#fff" strokeWidth={3}/></div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${t.border}` }}>
                    <span style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.08em' }}>Contribution</span>
                    {role ? (
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:12, color:t.textMuted, fontWeight:600 }}>₦</span>
                        <input type="number" className="rf" style={{ width:88, textAlign:'right', background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:9, padding:'4px 9px', fontSize:13, fontWeight:700, color:t.text, outline:'none' }} placeholder="0" value={data[person.id]?.[month] || ''} onChange={e => handleUpdate(person.id, month, e.target.value)}/>
                      </div>
                    ) : (
                      <div style={{ fontFamily:isPaid?"'Outfit',sans-serif":'inherit', fontSize:isPaid?13:12, fontWeight:isPaid?800:400, color:isPaid?t.emerald:t.textMuted, fontStyle:isPaid?'normal':'italic' }}>
                        {isPaid ? `₦${amount.toLocaleString()}` : 'Pending'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MASTER TABLE ── */}
        {view === 'master' && (
          <div className="fi" style={{ background:t.surface, borderRadius:16, border:`1px solid ${t.border}`, boxShadow:t.sh, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <div style={{ padding:'9px 14px 5px', display:'flex', alignItems:'center', gap:6, color:t.textMuted, fontSize:11, fontWeight:600 }}>
              <ChevronsLeftRight size={11}/> Swipe for all months
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:840 }}>
              <thead>
                <tr>
                  <th style={{ padding:'11px 14px', fontSize:10, fontWeight:700, color:t.textMuted, textTransform:'uppercase', textAlign:'left', borderBottom:`1px solid ${t.border}`, background:t.surfaceAlt, position:'sticky', left:0, zIndex:2, whiteSpace:'nowrap', minWidth:130 }}>Name</th>
                  {MONTHS.map(m => (
                    <th key={m} style={{ padding:'11px 9px', fontSize:10, fontWeight:700, color:m===month?t.accent:t.textMuted, textTransform:'uppercase', textAlign:'right', borderBottom:`1px solid ${t.border}`, background:m===month?`${t.accent}10`:t.surfaceAlt, whiteSpace:'nowrap', minWidth:48 }}>{m.slice(0,3)}</th>
                  ))}
                  <th style={{ padding:'11px 12px', fontSize:10, fontWeight:700, color:t.accentText, textTransform:'uppercase', textAlign:'right', borderBottom:`1px solid ${t.border}`, background:`${t.accent}0E`, position:'sticky', right:0, zIndex:2, whiteSpace:'nowrap', minWidth:72 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {masterList.map((person, i) => {
                  const annual = MONTHS.reduce((s, m) => s + (data[person.id]?.[m] || 0), 0);
                  return (
                    <tr key={person.id} className="rh" style={{ background:i%2===0?'transparent':`${t.surfaceAlt}55` }}>
                      <td style={{ padding:'10px 14px', fontSize:12, fontWeight:600, color:t.text, borderBottom:`1px solid ${t.border}`, position:'sticky', left:0, background:i%2===0?t.surface:t.surfaceAlt, zIndex:1, whiteSpace:'nowrap', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>{person.name}</td>
                      {MONTHS.map(m => {
                        const v = data[person.id]?.[m] || 0;
                        return <td key={m} style={{ padding:'10px 9px', textAlign:'right', fontSize:11, fontWeight:v>0?600:400, color:v>0?t.emerald:t.textMuted, borderBottom:`1px solid ${t.border}`, background:m===month?`${t.accent}06`:'transparent', whiteSpace:'nowrap' }}>{v>0?`₦${v.toLocaleString()}`:'—'}</td>;
                      })}
                      <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:800, color:t.accentText, borderBottom:`1px solid ${t.border}`, background:`${t.accent}08`, position:'sticky', right:0, zIndex:1, whiteSpace:'nowrap' }}>₦{annual.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', zIndex:50, background:dark?'#1C2333EE':'#0F172AEE', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:99, padding:'4px 6px', display:'flex', alignItems:'center', gap:2, boxShadow:'0 8px 32px rgba(0,0,0,0.45)' }}>
        {[['dashboard',LayoutGrid],['master',FileText]].map(([id,Icon]) => (
          <button key={id} onClick={() => setView(id)} className="bp" style={{ width:42, height:42, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', background:view===id?t.accent:'transparent', color:view===id?'#fff':'#94A3B8', border:'none', cursor:'pointer', transition:'all .15s' }}>
            <Icon size={17}/>
          </button>
        ))}
        <button onClick={() => setExpenseView(true)} className="bp" style={{ width:42, height:42, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', color:'#F87171', border:'none', cursor:'pointer' }}>
          <Receipt size={17}/>
        </button>
        {role === 'superadmin' && (
          <>
            <div style={{ width:1, height:20, background:'rgba(255,255,255,0.12)', margin:'0 2px' }}/>
            <button onClick={() => setManageView(true)} className="bp" style={{ width:42, height:42, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', color:'#F59E0B', border:'none', cursor:'pointer' }}>
              <Settings size={17}/>
            </button>
          </>
        )}
        <div style={{ width:1, height:20, background:'rgba(255,255,255,0.12)', margin:'0 2px' }}/>
        <button onClick={() => role ? setShowAccountSheet(true) : setShowLogin(true)} className="bp" style={{ width:42, height:42, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', color:role?(role==='superadmin'?'#F59E0B':'#10B981'):'#94A3B8', border:'none', cursor:'pointer' }}>
          {role ? <Shield size={17}/> : <Lock size={17}/>}
        </button>
        <button onClick={() => setDark(d => !d)} className="bp" style={{ width:42, height:42, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', color:'#94A3B8', border:'none', cursor:'pointer' }}>
          {dark ? <Sun size={17}/> : <Moon size={17}/>}
        </button>
      </div>

      {/* ── LOGIN SHEET ── */}
      {showLogin && (
        <Sheet onClose={() => setShowLogin(false)} surface={t.surface} shLg={t.shLg}>
          <SheetHeader gradient="linear-gradient(135deg,#1E1B4B,#4338CA)" icon={Unlock} title="Welcome Back" subtitle="Please sign in to continue" onClose={() => setShowLogin(false)}/>
          <div style={{ padding:'16px 20px 36px', display:'flex', flexDirection:'column', gap:10 }}>
            <input style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px', fontSize:14, fontWeight:500, color:t.text, outline:'none' }} className="rf" placeholder="Username" value={lf.u} onChange={e => { setLf(f => ({ ...f, u:e.target.value })); setLoginErr(''); }} autoComplete="off" onKeyDown={e => e.key === 'Enter' && doLogin()}/>
            <input type="password" style={{ width:'100%', height:46, background:t.surfaceAlt, border:`1.5px solid ${t.border}`, borderRadius:13, padding:'0 15px', fontSize:14, fontWeight:500, color:t.text, outline:'none' }} className="rf" placeholder="Password" value={lf.p} onChange={e => { setLf(f => ({ ...f, p:e.target.value })); setLoginErr(''); }} autoComplete="off" onKeyDown={e => e.key === 'Enter' && doLogin()}/>
            {loginErr && (
              <div style={{ display:'flex', alignItems:'center', gap:7, color:t.rose, fontSize:13, fontWeight:600 }}>
                <XCircle size={14}/>{loginErr}
              </div>
            )}
            <div style={{ display:'flex', gap:9, marginTop:4 }}>
              <button onClick={() => setShowLogin(false)} style={{ flex:1, height:46, borderRadius:13, background:'transparent', color:t.textMed, fontSize:14, fontWeight:600, border:`1px solid ${t.border}`, cursor:'pointer' }}>Cancel</button>
              <button onClick={doLogin} style={{ flex:1, height:46, borderRadius:13, background:t.accent, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', boxShadow:`0 4px 12px ${t.accent}44` }}>Sign In</button>
            </div>
          </div>
        </Sheet>
      )}

      {/* ── ACCOUNT SHEET ── */}
      {showAccountSheet && (
        <Sheet onClose={() => setShowAccountSheet(false)} surface={t.surface} shLg={t.shLg}>
          <div style={{ background:role==='superadmin'?'linear-gradient(135deg,#78350F,#D97706)':'linear-gradient(135deg,#064E3B,#10B981)', padding:'20px 20px 18px', borderRadius:'22px 22px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}><Shield size={20} color="#fff"/></div>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:'#fff', lineHeight:1 }}>{role === 'superadmin' ? 'Super Admin' : 'Admin'}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:3 }}>Currently signed in</div>
                </div>
              </div>
              <button onClick={() => setShowAccountSheet(false)} style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', color:'#fff' }}><X size={14}/></button>
            </div>
          </div>
          <div style={{ padding:'16px 20px 36px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:t.surfaceAlt, borderRadius:13, padding:'12px 15px', display:'flex', alignItems:'center', gap:10 }}>
              <div className="pl" style={{ width:8, height:8, borderRadius:99, background:role==='superadmin'?t.amber:t.emerald, flexShrink:0 }}/>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:t.text }}>Session active</div>
                <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>You have {role==='superadmin'?'full':'standard'} editing access</div>
              </div>
            </div>
            <button onClick={() => { setRole(null); setShowAccountSheet(false); toast$('Signed out'); }} className="bp" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9, height:48, borderRadius:13, background:t.roseLight, color:t.rose, fontSize:14, fontWeight:700, border:`1px solid ${t.rose}33`, cursor:'pointer' }}>
              <LogOut size={16}/>Sign Out
            </button>
          </div>
        </Sheet>
      )}

      {/* ── SORT SHEET ── */}
      {showSortSheet && (
        <Sheet onClose={() => setShowSortSheet(false)} surface={t.surface} shLg={t.shLg}>
          <SheetHeader gradient={`linear-gradient(135deg,#312E81,${t.accent})`} icon={SlidersHorizontal} title="Sort Order" subtitle="Choose how members are arranged" onClose={() => setShowSortSheet(false)}/>
          <div style={{ padding:'12px 16px 32px', display:'flex', flexDirection:'column', gap:8 }}>
            {SORT_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const active = sortMode === opt.id;
              return (
                <button key={opt.id} onClick={() => { setSortMode(opt.id); setShowSortSheet(false); }} className="bp" style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 14px', borderRadius:14, border:`1.5px solid ${active?t.accent:t.border}`, background:active?t.accentLight:'transparent', cursor:'pointer', textAlign:'left', width:'100%', transition:'all .15s' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:active?t.accent:t.surfaceAlt, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}>
                    <Icon size={16} color={active?'#fff':t.textMuted}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:active?t.accentText:t.text, lineHeight:1.2 }}>{opt.label}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>{opt.desc}</div>
                  </div>
                  {active && <div style={{ width:20, height:20, borderRadius:99, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={11} color="#fff" strokeWidth={3}/></div>}
                </button>
              );
            })}
          </div>
        </Sheet>
      )}
    </div>
  );
}