import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  query
} from 'firebase/firestore';
import { 
  Users, 
  Lock, 
  Unlock, 
  Download, 
  Search, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Filter,
  PieChart,
  LayoutGrid,
  CreditCard,
  Bell,
  ArrowUpRight,
  Menu
} from 'lucide-react';

// --- CONFIGURATION & INITIALIZATION ---
// Note: Using the API key provided in your configuration
const apiKey = "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs";
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "it-token.firebaseapp.com",
  projectId: "it-token",
  storageBucket: "it-token.firebasestorage.app",
  messagingSenderId: "804328953904",
  appId: "1:804328953904:web:e760545b579bf2527075f5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'm-bello-family-ledger';

const RAW_NAMES = [
  "HADIZA UMAR", "AHMAD UMAR (ABBA)", "ABUBAKAR UMAR (DAN INCIYO)", "ABDULLAHI UMAR",
  "SULAIMAN UMAR", "BILKISU UMAR (KATILA)", "SALIHU UMAR (SALO)", "SANI UMAR (AJILO)",
  "ZAHARAU UMAR", "UMAR MUHAMMAD", "AISHA UMAR (UMMI)", "MAHMOUD SHUAIB",
  "BELLO UMAR (BUB)", "SADIK UMAR (SADIYO)", "AMINU UMAR", "MUBARAK UMAR",
  "MARYAM UMAR (SIYAMA)", "SADIYA UMAR (JIMADA)", "UMAR UMAR (KHALIPHA)", "MUKHTAR UMAR",
  "YASIDA SULAIMAN ABBA", "AISHA SULAIMAN ABBA (UMMIN RIMI)", "HAUWA’U SULAIMAN ABBA (MAIJIDDA)",
  "MARYAM SULAIMAN ABBA", "RABI SULAIMAN ABBA", "ABDULLAHI ADO (DAN BILILI)", "UMMI ABDULLAHI",
  "FATIMA ABDULLAHI", "AISHA ABDULLAHI", "ABUBAKAR ABDULLAHI ABUBAKAR (ABBA G)", "UMMI MUHAMMAD",
  "AMIRA MUHAMMAD", "KHALIPHA MUHAMMAD", "MUSLIM SANI", "KAUTHAR SANI", "MUHAMMAD SANI",
  "BINTA ABDULSALAM", "UMMUL KHAIR MUKHTAR", "AISHA MUKHTAR (HAJIYA)", "ZAINAB MUKHTAR (AMIRA)",
  "ZAHARAU MUKHTAR", "MUHAMMAD MUKHTAR", "JAMILA ABDULSALAM", "KHADIJA BELLO (NANA)",
  "AHMAD BELLO", "HAFSAT BELLO", "SURAYYA BELLO", "SADIK ABDULSALAM", "UMMI ABDULSALAM",
  "HAFSAT SANI", "ABULKHAIR SANI", "MUHAMMAD SANI", "ZAHARAU ABDULSALAM (ANTY QARAMA)",
  "HASSAN MUHAMMAD", "HUSSAIN MUHAMMAD", "NAJA ABDULSALAM", "AHMAD ISMAIL", "ALIYU ISMAIL",
  "MUKHTAR ISMAIL", "RAHMA ABDULSALAM", "ALAMEEN ABDULSALAM", "NABILA BELLO", "NABIL BELLO",
  "FADIL BELLO", "IDRIS BELLO (ABBA)", "BILAL BELLO", "FADILA BELLO", "AISHA BELLO",
  "AMINA BELLO (KAKA)", "AL AMEEN BELLO", "HALIMA BELLO (ILHAM)", "FATIMA BELLO (AJUS)",
  "ZULFAU MOHD", "HINDATU FAROUK HARAZIMI (SHAHIDA)", "AISHA FAROUK HARAZIMI (IBTISAN)",
  "ABDULKADIR MOHD", "ZAHARAU MOHD", "MUHAMMAD IBRAHIM (ADNAN)", "FAROUK MOHD", "RABIA MOHD",
  "MUHAMMAD ABBA", "BELLO ABBA (BAFFA)", "AISHA M0HD (HAJIYA)", "HASSAN MOHD", "HUSSAIN MOHD",
  "HARRIS HASHIM", "HAFIZ HASHIM", "MUHAMMAD HASHIM", "MUTTAKA HASHIM (HALIPHA)",
  "IDRIS HASHIM (ABBATI)", "ALIYU HASHIM (HAIDAR)", "HALIMA HASHIM (ILHAM)", "IDRIS TIJJANI (BADAR)"
];

const CONTRIBUTORS = RAW_NAMES.map((name, index) => ({
  id: `member-${index}`,
  name: name,
  initials: name.split(' ').map(n => n[0]).join('').slice(0, 2)
}));

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(MONTHS[new Date().getMonth()]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [notification, setNotification] = useState(null);
  const [data, setData] = useState({});

  // --- Auth Setup ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Firestore Listener ---
  useEffect(() => {
    if (!user) return;

    const collectionPath = collection(db, 'artifacts', appId, 'public', 'data', 'contributions');
    const unsubscribe = onSnapshot(collectionPath, (snapshot) => {
      const newData = {};
      snapshot.forEach((doc) => {
        newData[doc.id] = doc.data();
      });
      setData(newData);
    }, (error) => {
      console.error("Firestore Error:", error);
      showToast("Sync Error: Please check connection", "error");
    });

    return () => unsubscribe();
  }, [user]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Logic ---
  const filteredContributors = useMemo(() => {
    return CONTRIBUTORS.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
      const personData = data[person.id] || {};
      const amount = personData[currentMonth] || 0;
      
      let matchesFilter = true;
      if (statusFilter === 'paid') matchesFilter = amount > 0;
      if (statusFilter === 'unpaid') matchesFilter = amount === 0;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, statusFilter, data, currentMonth]);

  const stats = useMemo(() => {
    const monthlyTotal = CONTRIBUTORS.reduce((sum, p) => sum + (data[p.id]?.[currentMonth] || 0), 0);
    const monthlyPaidCount = CONTRIBUTORS.filter(p => (data[p.id]?.[currentMonth] || 0) > 0).length;
    const annualTotal = CONTRIBUTORS.reduce((sum, p) => {
      return sum + MONTHS.reduce((mSum, m) => mSum + (data[p.id]?.[m] || 0), 0);
    }, 0);
    return { monthlyTotal, monthlyPaidCount, annualTotal };
  }, [data, currentMonth]);

  const handleUpdate = async (id, month, value) => {
    if (!isAdmin || !user) return;
    const numValue = parseFloat(value) || 0;
    
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'contributions', id);
      await setDoc(docRef, { [month]: numValue }, { merge: true });
    } catch (err) {
      showToast("Error updating database", "error");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'pass77') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      showToast("Admin access granted");
    } else {
      showToast("Invalid credentials", "error");
    }
  };

  const exportMonthlyCSV = () => {
    const header = "Name,Month,Amount (NGN)\n";
    const rows = CONTRIBUTORS.map(person => 
      `"${person.name}",${currentMonth},${data[person.id]?.[currentMonth] || 0}`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MBello_Family_${currentMonth}.csv`;
    link.click();
    showToast("CSV Exported successfully");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">M BELLO'S</h1>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Family Ledger</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="h-4 w-4" />
                Monthly Ledger
              </button>
              <button 
                onClick={() => setViewMode('master')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'master' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="h-4 w-4" />
                Master Year
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl group">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-tighter">Admin Mode</span>
                  <button onClick={() => { setIsAdmin(false); showToast("Admin signed out"); }} className="ml-2 text-emerald-400 hover:text-rose-500 transition-colors">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  <Lock className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Dashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">PERIOD</span>
            </div>
            <select 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="text-2xl font-black text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer w-full p-0"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-slate-400 text-xs font-semibold mt-1">Contribution data</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              ₦{stats.monthlyTotal.toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs font-semibold mt-1">{currentMonth} Collections</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-blue-600">{Math.round((stats.monthlyPaidCount/CONTRIBUTORS.length)*100)}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {stats.monthlyPaidCount} / {CONTRIBUTORS.length}
            </p>
            <p className="text-slate-400 text-xs font-semibold mt-1">Family Members Paid</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000" 
                style={{ width: `${(stats.monthlyPaidCount/CONTRIBUTORS.length)*100}%` }} 
              />
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-[2rem] shadow-xl shadow-indigo-100 group relative overflow-hidden">
            <PieChart className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-800 opacity-20 rotate-12" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-white/10 text-white rounded-2xl">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <p className="text-2xl font-black text-white relative z-10">
              ₦{stats.annualTotal.toLocaleString()}
            </p>
            <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest relative z-10">Total Annual Pool</p>
          </div>
        </section>

        {/* Search & Filter Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search family member..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Paid
              </button>
              <button 
                onClick={() => setStatusFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'unpaid' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Unpaid
              </button>
            </div>
             <button 
              onClick={exportMonthlyCSV}
              className="flex items-center justify-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl border border-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Ledger View */}
        {viewMode === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContributors.length > 0 ? (
              filteredContributors.map(person => {
                const amount = data[person.id]?.[currentMonth] || 0;
                const isPaid = amount > 0;
                
                return (
                  <div key={person.id} className={`bg-white rounded-[1.5rem] border p-5 transition-all group ${isPaid ? 'border-emerald-100 hover:border-emerald-300' : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                          {person.initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm leading-none">{person.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">ID: {person.id.split('-')[1]}</p>
                        </div>
                      </div>
                      {isPaid && (
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contribution</div>
                      {isAdmin ? (
                        <div className="flex items-center gap-2">
                           <span className="text-slate-400 text-xs">₦</span>
                           <input 
                            type="number"
                            placeholder="0"
                            className="w-24 bg-slate-50 border-none rounded-lg p-1 text-right text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={data[person.id]?.[currentMonth] || ''}
                            onChange={(e) => handleUpdate(person.id, currentMonth, e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className={`text-lg font-black ${isPaid ? 'text-emerald-600' : 'text-slate-300 italic font-medium text-sm'}`}>
                          {isPaid ? `₦${amount.toLocaleString()}` : "Not contributed"}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-bold italic">No results found for your filter/search</p>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-4 text-indigo-600 font-bold text-sm underline hover:text-indigo-800">Clear all filters</button>
              </div>
            )}
          </div>
        ) : (
          /* Master View (Table) */
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-[#FBFBFC] z-20 w-72">
                      Full Name
                    </th>
                    {MONTHS.map(m => (
                      <th key={m} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        {m.slice(0, 3)}
                      </th>
                    ))}
                    <th className="p-6 text-xs font-black text-indigo-600 uppercase tracking-widest text-right bg-indigo-50/50 sticky right-0 z-20">
                      Annual Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredContributors.map(person => {
                    const annual = MONTHS.reduce((sum, m) => sum + (data[person.id]?.[m] || 0), 0);
                    return (
                      <tr key={person.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6 font-bold text-slate-700 text-sm sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {person.initials}
                          </div>
                          {person.name}
                        </td>
                        {MONTHS.map(m => {
                          const val = data[person.id]?.[m] || 0;
                          return (
                            <td key={m} className={`p-4 text-right text-xs font-semibold ${val > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {val > 0 ? `₦${val.toLocaleString()}` : "—"}
                            </td>
                          );
                        })}
                        <td className="p-6 text-right text-sm font-black text-indigo-600 bg-indigo-50/30 sticky right-0 z-10 group-hover:bg-indigo-50 transition-colors">
                          ₦{annual.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Login Drawer/Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="bg-indigo-900 p-10 text-white relative overflow-hidden text-center">
              <div className="h-16 w-16 mx-auto bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm shadow-xl">
                <Unlock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Admin Gate</h3>
              <p className="text-indigo-300 text-sm font-semibold mt-2">Unlock editing features</p>
            </div>
            
            <form onSubmit={handleLogin} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-semibold"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Security Key</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-semibold"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 rounded-2xl bg-indigo-900 text-white font-black hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Nav (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex gap-1 shadow-2xl">
           <button 
            onClick={() => setViewMode('dashboard')}
            className={`p-3 rounded-full transition-all ${viewMode === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('master')}
            className={`p-3 rounded-full transition-all ${viewMode === 'master' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <FileText className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1 my-auto" />
          <button 
            onClick={() => setShowLogin(true)}
            className="p-3 text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;