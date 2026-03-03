import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  Users, Lock, Unlock, Download, Search, Calendar, FileText,
  CheckCircle, XCircle, TrendingUp, UserCheck, PieChart,
  LayoutGrid, CreditCard, ArrowUpRight, ChevronsLeftRight,
  UserPlus, Trash2, Edit3, Save, Moon, Sun, Shield,
  MoreVertical, AlertTriangle, Check
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

// Credential vault — split/encoded, usernames & passwords stored separately
const _ku = [atob('YWRtaW4='), atob('YWRtaW43Nw==')];
const _kp = [atob('cGFzczc3'), atob('c2V2ZW50eXNldmVu')];
const _kr = ['admin', 'superadmin'];
const _verify = (u, p) => {
  const i = _ku.indexOf(u.trim());
  return (i !== -1 && _kp[i] === p.trim()) ? _kr[i] : null;
};

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

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const mkInitials = (n) => n.split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const mkId = (name) => `member-${name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)}-${Date.now()}`;

// Theme tokens
const T = {
  light: {
    bg:'#F2F5FB', surface:'#FFFFFF', surfaceAlt:'#F7F9FF',
    border:'#E4EAF5', borderStrong:'#CDD5EC',
    text:'#0F172A', textMed:'#475569', textMuted:'#94A3B8',
    accent:'#4F46E5', accentLight:'#EEF2FF', accentText:'#4338CA',
    emerald:'#10B981', emeraldLight:'#ECFDF5',
    rose:'#F43F5E', roseLight:'#FFF1F2',
    amber:'#D97706', amberLight:'#FFFBEB',
    headerBg:'#FFFFFF',
    sh:'0 1px 3px rgba(0,0,0,0.06)', shMd:'0 4px 20px rgba(0,0,0,0.09)', shLg:'0 12px 40px rgba(0,0,0,0.14)',
  },
  dark: {
    bg:'#0D1117', surface:'#161B26', surfaceAlt:'#1C2333',
    border:'#252D3D', borderStrong:'#2E3A50',
    text:'#E2E8F0', textMed:'#94A3B8', textMuted:'#475569',
    accent:'#6366F1', accentLight:'#1E1B4B', accentText:'#A5B4FC',
    emerald:'#10B981', emeraldLight:'#022C22',
    rose:'#F43F5E', roseLight:'#1F0714',
    amber:'#F59E0B', amberLight:'#1C1501',
    headerBg:'#161B26',
    sh:'0 1px 3px rgba(0,0,0,0.3)', shMd:'0 4px 20px rgba(0,0,0,0.45)', shLg:'0 12px 40px rgba(0,0,0,0.6)',
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [lf, setLf] = useState({ u: '', p: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [view, setView] = useState('dashboard');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [search, setSearch] = useState('');
  const [filt, setFilt] = useState('all');
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({});
  const [members, setMembers] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [menu, setMenu] = useState(null);
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
    return onSnapshot(ref, async (snap) => {
      if (snap.exists() && snap.data()?.list) {
        setMembers(snap.data().list);
      } else {
        const seed = SEED_NAMES.map((name, i) => ({ id: `member-${i}`, name, initials: mkInitials(name), order: i }));
        await setDoc(ref, { list: seed });
        setMembers(seed);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(_db, 'artifacts', _aid, 'public', 'data', 'contributions'), (snap) => {
      const nd = {};
      snap.forEach(d => { nd[d.id] = d.data(); });
      setData(nd);
    }, () => toast$('Sync error', 'error'));
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const r = _verify(lf.u, lf.p);
    if (r) {
      setRole(r); setShowLogin(false); setLf({ u:'', p:'' }); setLoginErr('');
      toast$(r === 'superadmin' ? '🛡 Super Admin unlocked' : '✓ Admin mode active');
    } else { setLoginErr('Invalid credentials'); }
  };

  const handleUpdate = async (id, m, val) => {
    if (!role || !user) return;
    try {
      await setDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'contributions', id),
        { [m]: parseFloat(val) || 0 }, { merge: true });
    } catch { toast$('Update failed', 'error'); }
  };

  const saveMembers = async (list) => {
    await setDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'meta', 'members'), { list });
  };

  const handleAdd = async () => {
    const name = addName.trim().toUpperCase();
    if (!name) return;
    try {
      const updated = [...members, { id: mkId(name), name, initials: mkInitials(name), order: members.length }];
      await saveMembers(updated);
      setAddModal(false); setAddName(''); toast$(`${name} added`);
    } catch { toast$('Failed to add', 'error'); }
  };

  const handleEdit = async () => {
    const name = editName.trim().toUpperCase();
    if (!name || !editModal) return;
    try {
      await saveMembers(members.map(m => m.id === editModal.id ? { ...m, name, initials: mkInitials(name) } : m));
      setEditModal(null); setEditName(''); toast$('Name updated');
    } catch { toast$('Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await saveMembers(members.filter(m => m.id !== id));
      await deleteDoc(doc(_db, 'artifacts', _aid, 'public', 'data', 'contributions', id));
      setDelConfirm(null); toast$('Member removed');
    } catch { toast$('Failed to remove', 'error'); }
  };

  const dashList = useMemo(() => {
    const f = members.filter(p => {
      const ms = p.name.toLowerCase().includes(search.toLowerCase());
      const amt = data[p.id]?.[month] || 0;
      if (filt === 'paid') return ms && amt > 0;
      if (filt === 'unpaid') return ms && amt === 0;
      return ms;
    });
    return [...f].sort((a,b) => {
      const av = data[a.id]?.[month]||0, bv = data[b.id]?.[month]||0;
      return bv > 0 && av === 0 ? 1 : av > 0 && bv === 0 ? -1 : 0;
    });
  }, [members, search, filt, data, month]);

  const masterList = useMemo(() =>
    members.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [members, search]);

  const stats = useMemo(() => {
    const mTotal = members.reduce((s,p) => s+(data[p.id]?.[month]||0), 0);
    const paid = members.filter(p => (data[p.id]?.[month]||0) > 0).length;
    const annual = members.reduce((s,p) => s+MONTHS.reduce((ms,m)=>ms+(data[p.id]?.[m]||0),0), 0);
    return { mTotal, paid, annual, total: members.length };
  }, [members, data, month]);

  const pct = stats.total ? Math.round(stats.paid/stats.total*100) : 0;

  const exportCSV = () => {
    let csv, fn;
    if (view === 'dashboard') {
      csv = 'Name,Month,Amount (NGN)\n' + members.map(p => `"${p.name}",${month},${data[p.id]?.[month]||0}`).join('\n');
      fn = `AYakasai_${month}.csv`;
    } else {
      csv = 'Name,'+MONTHS.join(',')+',Annual Total\n' + members.map(p => {
        const vs = MONTHS.map(m => data[p.id]?.[m]||0);
        return `"${p.name}",${vs.join(',')},${vs.reduce((a,b)=>a+b,0)}`;
      }).join('\n');
      fn = 'AYakasai_Master.csv';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}));
    a.download = fn; a.click();
    toast$('CSV exported');
  };

  // ── Inline styles generated from theme ──
  const css = `
   @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    select{-webkit-appearance:none;appearance:none}
    .fi{animation:fi .25s ease}
    @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    .su{animation:su .32s cubic-bezier(.16,1,.3,1)}
    @keyframes su{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .ti{animation:ti .3s cubic-bezier(.16,1,.3,1)}
    @keyframes ti{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
    .ch:hover{transform:translateY(-2px);box-shadow:${t.shMd}}
    .ch{transition:transform .15s,box-shadow .15s,border-color .15s}
    .bp:active{transform:scale(.95)!important}
    .bp{transition:transform .1s,opacity .1s}
    .rf:focus{outline:none;box-shadow:0 0 0 3px ${t.accent}44}
    .rf{transition:border-color .15s,box-shadow .15s}
    .mbi:hover{background:${t.surfaceAlt}!important}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .pl{animation:pulse 2s infinite}
    .rh:hover{background:${t.surfaceAlt}!important}
    .di{background:${t.surfaceAlt}!important}
  `;

  return (
    <div style={{minHeight:'100vh',background:t.bg,color:t.text,fontFamily:"'DM Sans',sans-serif",transition:'background .2s,color .2s'}}>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',top:16,right:16,zIndex:100}} className="ti">
          <div style={{
            display:'flex',alignItems:'center',gap:9,padding:'11px 16px',borderRadius:14,
            background:toast.type==='error'?t.roseLight:t.emeraldLight,
            border:`1px solid ${toast.type==='error'?t.rose+'44':t.emerald+'44'}`,
            color:toast.type==='error'?t.rose:t.emerald,
            fontSize:13,fontWeight:600,boxShadow:t.shMd,maxWidth:300,
          }}>
            {toast.type==='error' ? <XCircle size={15}/> : <CheckCircle size={15}/>}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:t.headerBg,borderBottom:`1px solid ${t.border}`,position:'sticky',top:0,zIndex:40,boxShadow:t.sh}}>
        <div style={{maxWidth:1300,margin:'0 auto',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${t.accent},#7C3AED)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 12px ${t.accent}45`,flexShrink:0}}>
              <Users size={19} color="#fff"/>
            </div>
            <div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:17,color:t.text,letterSpacing:'-0.3px',lineHeight:1}}>A YAKASAI</div>
              <div style={{fontSize:9,fontWeight:700,color:t.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',marginTop:3}}>Family Ledger</div>
            </div>
          </div>

          {/* Desktop tabs */}
          <div style={{display:'flex',gap:3,background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:12,padding:4}}>
            {[['dashboard','Monthly Ledger',LayoutGrid],['master','Master Year',FileText]].map(([id,lbl,Icon])=>(
              <button key={id} onClick={()=>setView(id)} className="bp" style={{display:'flex',alignItems:'center',gap:7,padding:'7px 16px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',border:'none',background:view===id?t.surface:'transparent',color:view===id?t.accent:t.textMed,boxShadow:view===id?t.sh:'none',transition:'all .15s',whiteSpace:'nowrap'}}>
                <Icon size={14}/>{lbl}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setDark(d=>!d)} className="bp" style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${t.border}`,background:t.surface,cursor:'pointer',color:t.textMed}}>
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            {role ? (
              <div style={{display:'flex',alignItems:'center',gap:8,background:role==='superadmin'?t.amberLight:t.emeraldLight,border:`1px solid ${role==='superadmin'?t.amber+'44':t.emerald+'44'}`,borderRadius:10,padding:'6px 12px'}}>
                <div className="pl" style={{width:7,height:7,borderRadius:99,background:role==='superadmin'?t.amber:t.emerald}}/>
                <span style={{fontSize:12,fontWeight:700,color:role==='superadmin'?t.amber:t.emerald}}>
                  {role==='superadmin'?'Super Admin':'Admin'}
                </span>
                <button onClick={()=>{setRole(null);toast$('Signed out');}} style={{border:'none',background:'none',color:t.textMuted,cursor:'pointer',display:'flex',padding:0,marginLeft:2}}>
                  <XCircle size={14}/>
                </button>
              </div>
            ) : (
              <button onClick={()=>setShowLogin(true)} className="bp" style={{display:'flex',alignItems:'center',gap:7,background:t.accent,color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',border:'none',boxShadow:`0 4px 12px ${t.accent}45`}}>
                <Lock size={14}/><span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1300,margin:'0 auto',padding:'24px 16px 110px'}}>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginBottom:24}}>
          {/* Month */}
          <div className="ch" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:'18px 20px',boxShadow:t.sh}}>
            <div style={{width:40,height:40,borderRadius:12,background:t.accentLight,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <Calendar size={19} color={t.accent}/>
            </div>
            <select style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,color:t.text,background:'transparent',border:'none',cursor:'pointer',width:'100%',outline:'none'}} value={month} onChange={e=>setMonth(e.target.value)}>
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:5}}>Viewing period</div>
          </div>

          {/* Monthly total */}
          <div className="ch" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:'18px 20px',boxShadow:t.sh}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:t.emeraldLight,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <TrendingUp size={19} color={t.emerald}/>
              </div>
              <ArrowUpRight size={15} color={t.emerald}/>
            </div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color:t.text,letterSpacing:'-0.5px',lineHeight:1}}>₦{stats.mTotal.toLocaleString()}</div>
            <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:5}}>{month} Collections</div>
          </div>

          {/* Paid count */}
          <div className="ch" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:'18px 20px',boxShadow:t.sh}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:t.accentLight,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <UserCheck size={19} color={t.accent}/>
              </div>
              <span style={{fontSize:12,fontWeight:800,color:t.accent,background:t.accentLight,borderRadius:8,padding:'3px 8px'}}>{pct}%</span>
            </div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color:t.text,letterSpacing:'-0.5px',lineHeight:1}}>
              {stats.paid} <span style={{fontSize:15,color:t.textMuted,fontWeight:600}}>/ {stats.total}</span>
            </div>
            <div style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:5}}>Paid this month</div>
            <div style={{height:4,borderRadius:99,background:t.border,overflow:'hidden',marginTop:10}}>
              <div style={{height:'100%',borderRadius:99,background:t.emerald,width:`${pct}%`,transition:'width .6s ease'}}/>
            </div>
          </div>

          {/* Annual */}
          <div style={{background:`linear-gradient(135deg,${t.accent} 0%,#7C3AED 100%)`,borderRadius:20,padding:'18px 20px',boxShadow:`0 8px 28px ${t.accent}45`,position:'relative',overflow:'hidden'}}>
            <PieChart size={90} color="#ffffff14" style={{position:'absolute',right:-14,bottom:-14,transform:'rotate(20deg)'}}/>
            <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,position:'relative',zIndex:1}}>
              <CreditCard size={19} color="#fff"/>
            </div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color:'#fff',letterSpacing:'-0.5px',lineHeight:1,position:'relative',zIndex:1}}>₦{stats.annual.toLocaleString()}</div>
            <div style={{fontSize:10,fontWeight:700,color:'#C7D2FE',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:5,position:'relative',zIndex:1}}>Total Annual Pool</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{position:'relative',flex:'1 1 240px',minWidth:0}}>
            <Search size={16} color={t.textMuted} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
            <input style={{width:'100%',paddingLeft:42,paddingRight:14,height:44,borderRadius:13,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:14,fontWeight:500,outline:'none'}} className="rf" placeholder="Search family member…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:3,background:t.surface,border:`1px solid ${t.border}`,borderRadius:11,padding:3,flexShrink:0}}>
            {['all','paid','unpaid'].map(f=>(
              <button key={f} onClick={()=>setFilt(f)} className="bp" style={{padding:'6px 13px',borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:filt===f?t.accent:'transparent',color:filt===f?'#fff':t.textMed,transition:'all .15s',textTransform:'capitalize'}}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="bp" style={{display:'flex',alignItems:'center',gap:7,height:44,padding:'0 16px',borderRadius:13,border:`1px solid ${t.border}`,background:t.surface,color:t.textMed,fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            <Download size={15}/>CSV
          </button>
          {role==='superadmin' && (
            <button onClick={()=>setAddModal(true)} className="bp" style={{display:'flex',alignItems:'center',gap:7,height:44,padding:'0 16px',borderRadius:13,border:`1px solid ${t.amber}55`,background:t.amberLight,color:t.amber,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              <UserPlus size={15}/>Add Member
            </button>
          )}
        </div>

        {/* Dashboard cards */}
        {view==='dashboard' && (
          <div className="fi" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(275px,1fr))',gap:13}}>
            {dashList.length===0 ? (
              <div style={{gridColumn:'1/-1',padding:'56px 20px',background:t.surface,borderRadius:20,border:`1px dashed ${t.border}`,display:'flex',flexDirection:'column',alignItems:'center',gap:12,color:t.textMuted}}>
                <Search size={30} color={t.border}/>
                <div style={{fontWeight:700}}>No results found</div>
                <button onClick={()=>{setSearch('');setFilt('all');}} style={{color:t.accent,fontSize:13,fontWeight:700,border:'none',background:'none',cursor:'pointer'}}>Clear filters</button>
              </div>
            ) : dashList.map(person => {
              const amount = data[person.id]?.[month]||0;
              const isPaid = amount>0;
              const menuOpen = menu===person.id;
              return (
                <div key={person.id} className="ch" style={{background:t.surface,border:`1px solid ${isPaid?t.emerald+'33':t.border}`,borderRadius:18,padding:'17px 19px',position:'relative'}}>
                  {role==='superadmin' && (
                    <div style={{position:'absolute',top:12,right:12}}>
                      <button onClick={()=>setMenu(menuOpen?null:person.id)} style={{width:28,height:28,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${t.border}`,background:t.surfaceAlt,cursor:'pointer',color:t.textMuted}}>
                        <MoreVertical size={13}/>
                      </button>
                      {menuOpen && (
                        <div className="fi" style={{position:'absolute',right:0,top:34,zIndex:20,background:t.surface,border:`1px solid ${t.border}`,borderRadius:13,overflow:'hidden',boxShadow:t.shMd,minWidth:145}}>
                          <button onClick={()=>{setEditModal({id:person.id,name:person.name});setEditName(person.name);setMenu(null);}} className="mbi" style={{display:'flex',alignItems:'center',gap:9,padding:'11px 15px',fontSize:13,fontWeight:600,color:t.text,cursor:'pointer',border:'none',background:'transparent',width:'100%',textAlign:'left'}}>
                            <Edit3 size={13}/>Edit Name
                          </button>
                          <button onClick={()=>{setDelConfirm(person.id);setMenu(null);}} className="mbi" style={{display:'flex',alignItems:'center',gap:9,padding:'11px 15px',fontSize:13,fontWeight:600,color:t.rose,cursor:'pointer',border:'none',background:'transparent',width:'100%',textAlign:'left'}}>
                            <Trash2 size={13}/>Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:800,background:isPaid?t.emeraldLight:t.surfaceAlt,color:isPaid?t.emerald:t.textMuted,flexShrink:0}}>
                      {person.initials}
                    </div>
                    <div style={{flex:1,minWidth:0,paddingRight:role==='superadmin'?28:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:t.text,lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{person.name}</div>
                      <div style={{fontSize:10,fontWeight:600,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>#{String(person.id).slice(-4)}</div>
                    </div>
                    {isPaid && <div style={{width:24,height:24,borderRadius:99,background:t.emerald,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Check size={13} color="#fff" strokeWidth={3}/></div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:13,borderTop:`1px solid ${t.border}`}}>
                    <span style={{fontSize:10,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em'}}>Contribution</span>
                    {role ? (
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <span style={{fontSize:13,color:t.textMuted,fontWeight:600}}>₦</span>
                        <input type="number" className="rf" style={{width:95,textAlign:'right',background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:'5px 10px',fontSize:13,fontWeight:700,color:t.text,outline:'none'}} placeholder="0" value={data[person.id]?.[month]||''} onChange={e=>handleUpdate(person.id,month,e.target.value)}/>
                      </div>
                    ) : (
                      <div style={{fontFamily:isPaid?"'Outfit',sans-serif":'inherit',fontSize:isPaid?14:12,fontWeight:isPaid?800:400,color:isPaid?t.emerald:t.textMuted,fontStyle:isPaid?'normal':'italic'}}>
                        {isPaid ? `₦${amount.toLocaleString()}` : 'Pending'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Master table */}
        {view==='master' && (
          <div className="fi" style={{background:t.surface,borderRadius:20,border:`1px solid ${t.border}`,boxShadow:t.sh,overflowX:'auto'}}>
            <div style={{padding:'10px 16px 6px',display:'flex',alignItems:'center',gap:6,color:t.textMuted,fontSize:11,fontWeight:600}}>
              <ChevronsLeftRight size={12}/> Scroll horizontally for all months
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
              <thead>
                <tr>
                  <th style={{padding:'13px 18px',fontSize:10,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'left',borderBottom:`1px solid ${t.border}`,background:t.surfaceAlt,position:'sticky',left:0,zIndex:2,whiteSpace:'nowrap'}}>Full Name</th>
                  {MONTHS.map(m=>(
                    <th key={m} style={{padding:'13px 14px',fontSize:10,fontWeight:700,color:m===month?t.accent:t.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'right',borderBottom:`1px solid ${t.border}`,background:m===month?`${t.accent}10`:t.surfaceAlt,whiteSpace:'nowrap'}}>
                      {m.slice(0,3)}
                    </th>
                  ))}
                  <th style={{padding:'13px 18px',fontSize:10,fontWeight:700,color:t.accentText,textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'right',borderBottom:`1px solid ${t.border}`,background:`${t.accent}0E`,position:'sticky',right:0,zIndex:2,whiteSpace:'nowrap'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {masterList.map((person,i)=>{
                  const annual = MONTHS.reduce((s,m)=>s+(data[person.id]?.[m]||0),0);
                  return (
                    <tr key={person.id} className="rh" style={{background:i%2===0?'transparent':`${t.surfaceAlt}55`,transition:'background .1s'}}>
                      <td style={{padding:'11px 18px',fontSize:13,fontWeight:600,color:t.text,borderBottom:`1px solid ${t.border}`,position:'sticky',left:0,background:i%2===0?t.surface:t.surfaceAlt,zIndex:1,whiteSpace:'nowrap'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          {role==='superadmin' && (
                            <div style={{display:'flex',gap:3,flexShrink:0}}>
                              <button onClick={()=>{setEditModal({id:person.id,name:person.name});setEditName(person.name);}} style={{width:22,height:22,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${t.border}`,background:t.surfaceAlt,cursor:'pointer',color:t.textMuted}}><Edit3 size={10}/></button>
                              <button onClick={()=>setDelConfirm(person.id)} style={{width:22,height:22,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${t.rose}44`,background:t.roseLight,cursor:'pointer',color:t.rose}}><Trash2 size={10}/></button>
                            </div>
                          )}
                          {person.name}
                        </div>
                      </td>
                      {MONTHS.map(m=>{
                        const v=data[person.id]?.[m]||0;
                        return <td key={m} style={{padding:'11px 14px',textAlign:'right',fontSize:12,fontWeight:v>0?600:400,color:v>0?t.emerald:t.textMuted,borderBottom:`1px solid ${t.border}`,background:m===month?`${t.accent}06`:'transparent',whiteSpace:'nowrap'}}>
                          {v>0?`₦${v.toLocaleString()}`:'—'}
                        </td>;
                      })}
                      <td style={{padding:'11px 18px',textAlign:'right',fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:800,color:t.accentText,borderBottom:`1px solid ${t.border}`,background:`${t.accent}08`,position:'sticky',right:0,zIndex:1,whiteSpace:'nowrap'}}>
                        ₦{annual.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <div style={{position:'fixed',bottom:18,left:'50%',transform:'translateX(-50%)',zIndex:50,background:dark?'#1C2333EE':'#0F172AEE',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:99,padding:'5px 8px',display:'flex',alignItems:'center',gap:3,boxShadow:'0 8px 32px rgba(0,0,0,0.45)'}}>
        {[['dashboard',LayoutGrid],['master',FileText]].map(([id,Icon])=>(
          <button key={id} onClick={()=>setView(id)} className="bp" style={{width:42,height:42,borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',background:view===id?t.accent:'transparent',color:view===id?'#fff':'#94A3B8',border:'none',cursor:'pointer',transition:'all .15s'}}>
            <Icon size={18}/>
          </button>
        ))}
        <div style={{width:1,height:22,background:'rgba(255,255,255,0.12)',margin:'0 3px'}}/>
        <button onClick={()=>setShowLogin(true)} className="bp" style={{width:42,height:42,borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',color:role?(role==='superadmin'?t.amber:t.emerald):'#94A3B8',border:'none',cursor:'pointer',transition:'all .15s'}}>
          {role ? <Shield size={18}/> : <Lock size={18}/>}
        </button>
        <button onClick={()=>setDark(d=>!d)} className="bp" style={{width:42,height:42,borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',color:'#94A3B8',border:'none',cursor:'pointer',transition:'all .15s'}}>
          {dark?<Sun size={18}/>:<Moon size={18}/>}
        </button>
      </div>

      {/* Login modal */}
      {showLogin && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>e.target===e.currentTarget&&setShowLogin(false)}>
          <div className="su" style={{background:t.surface,borderRadius:24,width:'100%',maxWidth:400,boxShadow:t.shLg,overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#1E1B4B,#4338CA)',padding:'26px 26px 22px'}}>
              <div style={{display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:46,height:46,borderRadius:13,background:'rgba(255,255,255,0.13)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Unlock size={21} color="#fff"/>
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:800,color:'#fff',lineHeight:1}}>Admin Gate</div>
                  <div style={{fontSize:12,color:'#A5B4FC',marginTop:4}}>Unlock editing features</div>
                </div>
              </div>
            </div>
            <form onSubmit={handleLogin} style={{padding:'22px 26px 26px'}}>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                <input style={{width:'100%',height:46,background:t.surfaceAlt,border:`1.5px solid ${t.border}`,borderRadius:13,padding:'0 15px',fontSize:14,fontWeight:500,color:t.text,outline:'none'}} className="rf" placeholder="Username" value={lf.u} onChange={e=>{setLf(f=>({...f,u:e.target.value}));setLoginErr('');}} autoComplete="off"/>
                <input type="password" style={{width:'100%',height:46,background:t.surfaceAlt,border:`1.5px solid ${t.border}`,borderRadius:13,padding:'0 15px',fontSize:14,fontWeight:500,color:t.text,outline:'none'}} className="rf" placeholder="Password" value={lf.p} onChange={e=>{setLf(f=>({...f,p:e.target.value}));setLoginErr('');}} autoComplete="off"/>
                {loginErr && <div style={{display:'flex',alignItems:'center',gap:7,color:t.rose,fontSize:13,fontWeight:600}}><XCircle size={14}/>{loginErr}</div>}
                <div style={{display:'flex',gap:9,marginTop:6}}>
                  <button type="button" onClick={()=>setShowLogin(false)} style={{flex:1,height:46,borderRadius:13,background:'transparent',color:t.textMed,fontSize:14,fontWeight:600,border:`1px solid ${t.border}`,cursor:'pointer'}}>Cancel</button>
                  <button type="submit" style={{flex:1,height:46,borderRadius:13,background:t.accent,color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',boxShadow:`0 4px 12px ${t.accent}44`}}>Verify</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member modal */}
      {addModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>e.target===e.currentTarget&&setAddModal(false)}>
          <div className="su" style={{background:t.surface,borderRadius:24,width:'100%',maxWidth:400,boxShadow:t.shLg,overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#78350F,#D97706)',padding:'26px 26px 22px'}}>
              <div style={{display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:46,height:46,borderRadius:13,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <UserPlus size={21} color="#fff"/>
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:800,color:'#fff',lineHeight:1}}>Add Family Member</div>
                  <div style={{fontSize:12,color:'#FDE68A',marginTop:4}}>Syncs across all devices instantly</div>
                </div>
              </div>
            </div>
            <div style={{padding:'22px 26px 26px'}}>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                <input style={{width:'100%',height:46,background:t.surfaceAlt,border:`1.5px solid ${t.border}`,borderRadius:13,padding:'0 15px',fontSize:14,fontWeight:500,color:t.text,outline:'none',textTransform:'uppercase'}} className="rf" placeholder="FULL NAME (e.g. IBRAHIM MUSA)" value={addName} onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} autoFocus/>
                <div style={{display:'flex',gap:9,marginTop:6}}>
                  <button onClick={()=>{setAddModal(false);setAddName('');}} style={{flex:1,height:46,borderRadius:13,background:'transparent',color:t.textMed,fontSize:14,fontWeight:600,border:`1px solid ${t.border}`,cursor:'pointer'}}>Cancel</button>
                  <button onClick={handleAdd} style={{flex:1,height:46,borderRadius:13,background:'#D97706',color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',boxShadow:'0 4px 12px #D9770644'}}>Add Member</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div className="su" style={{background:t.surface,borderRadius:24,width:'100%',maxWidth:400,boxShadow:t.shLg,overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#0F3460,#1A6BAE)',padding:'26px 26px 22px'}}>
              <div style={{display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:46,height:46,borderRadius:13,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Edit3 size={21} color="#fff"/>
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:800,color:'#fff',lineHeight:1}}>Edit Name</div>
                  <div style={{fontSize:12,color:'#BAE6FD',marginTop:4}}>Updates everywhere in the ledger</div>
                </div>
              </div>
            </div>
            <div style={{padding:'22px 26px 26px'}}>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                <input style={{width:'100%',height:46,background:t.surfaceAlt,border:`1.5px solid ${t.border}`,borderRadius:13,padding:'0 15px',fontSize:14,fontWeight:500,color:t.text,outline:'none',textTransform:'uppercase'}} className="rf" value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEdit()} autoFocus/>
                <div style={{display:'flex',gap:9,marginTop:6}}>
                  <button onClick={()=>setEditModal(null)} style={{flex:1,height:46,borderRadius:13,background:'transparent',color:t.textMed,fontSize:14,fontWeight:600,border:`1px solid ${t.border}`,cursor:'pointer'}}>Cancel</button>
                  <button onClick={handleEdit} style={{flex:1,height:46,borderRadius:13,background:t.accent,color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',boxShadow:`0 4px 12px ${t.accent}44`,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                    <Save size={15}/> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>e.target===e.currentTarget&&setDelConfirm(null)}>
          <div className="su" style={{background:t.surface,borderRadius:24,width:'100%',maxWidth:380,boxShadow:t.shLg,padding:'32px 28px 28px',textAlign:'center'}}>
            <div style={{width:58,height:58,borderRadius:99,background:t.roseLight,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <AlertTriangle size={26} color={t.rose}/>
            </div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:800,color:t.text,marginBottom:9}}>Remove Member?</div>
            <div style={{fontSize:13,color:t.textMed,marginBottom:24,lineHeight:1.6}}>
              This will permanently remove <strong>{members.find(m=>m.id===delConfirm)?.name}</strong> and all their contribution history.
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setDelConfirm(null)} style={{flex:1,height:46,borderRadius:13,background:'transparent',color:t.textMed,fontSize:14,fontWeight:600,border:`1px solid ${t.border}`,cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>handleDelete(delConfirm)} style={{flex:1,height:46,borderRadius:13,background:t.roseLight,color:t.rose,fontSize:14,fontWeight:700,border:`1px solid ${t.rose}44`,cursor:'pointer'}}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Menu backdrop */}
      {menu && <div style={{position:'fixed',inset:0,zIndex:15}} onClick={()=>setMenu(null)}/>}
    </div>
  );
}
