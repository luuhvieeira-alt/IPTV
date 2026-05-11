/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { auth, db } from './lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  Users, 
  PlusCircle, 
  Calendar, 
  LogOut, 
  Tv, 
  Search, 
  AlertCircle,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { VencimentosCalendar } from './components/VencimentosCalendar';
import { Credits } from './components/Credits';
import { Dashboard } from './components/Dashboard';

export interface ClientData {
  id: string;
  name: string;
  whatsapp: string;
  plan: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  points: number;
  monthlyValue: number;
  devices: {
    appName: string;
    macAddress: string;
    macPassword?: string;
  }[];
  hasBackupServer: boolean;
  backupServerName?: string;
  backupLogin?: string;
  backupExpirationDate?: Timestamp;
  startDate?: Timestamp;
  expirationDate: Timestamp;
  serverName?: string;
  lastRenewalDate?: Timestamp;
  notes?: string;
  ownerId: string;
  createdAt: Timestamp;
}

export interface CreditData {
  id: string;
  date: Timestamp;
  value: number;
  quantity: number;
  serverName: string;
  ownerId: string;
  createdAt: Timestamp;
}

type Tab = 'dashboard' | 'cadastro' | 'clientes' | 'calendario' | 'creditos';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check session
  useEffect(() => {
    try {
      const session = sessionStorage.getItem('iptv_auth');
      if (session === 'true') {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setClients([]);
      return;
    }

    // Fetch all clients (single admin system)
    const q = query(collection(db, 'clients'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClientData[];
      setClients(docs);
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    const creditsQuery = query(collection(db, 'credits'));
    const unsubCredits = onSnapshot(creditsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CreditData[];
      setCredits(docs);
    }, (error) => {
      console.error("Firestore Credits Error: ", error);
    });

    return () => {
      unsub();
      unsubCredits();
    };
  }, [isLoggedIn]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginForm.username === 'admin' && loginForm.password === '1234') {
      setIsLoggedIn(true);
      try {
        sessionStorage.setItem('iptv_auth', 'true');
      } catch (e) {
        console.warn("Failed to set session:", e);
      }
    } else {
      setLoginError('Credenciais inválidas. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      sessionStorage.removeItem('iptv_auth');
    } catch (e) {
      console.warn("Failed to clear session:", e);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 text-white font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#0F172A] p-10 rounded-2xl shadow-2xl border border-slate-800"
        >
          <div className="bg-blue-500/10 p-4 rounded-full w-fit mx-auto mb-6">
            <Tv size={64} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tighter text-center">IPTV CONTROL</h1>
          <p className="text-slate-400 mb-10 text-center text-sm uppercase tracking-widest font-bold">Acesso Restrito</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Usuário</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  autoFocus
                  autoComplete="off"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all text-sm"
                  placeholder="Nome de usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Senha</label>
              <div className="relative">
                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-400 text-xs text-center font-bold animate-pulse">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all active:scale-95 shadow-xl shadow-blue-600/10 uppercase tracking-widest text-xs"
            >
              Entrar no Painel
            </button>
          </form>
        </motion.div>
        
        <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          © 2026 IPTV Manager Pro • Sistema Privado
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0F172A] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Tv className="text-blue-500" />
          <span className="font-bold text-lg uppercase tracking-wider">IPTV Control</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:relative z-50 w-64 h-full bg-[#0F172A] border-r border-slate-800 p-6 flex flex-col ${isSidebarOpen ? 'block' : 'hidden md:flex'}`}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20 text-white">
                  <Tv size={24} />
                </div>
                <h2 className="font-black text-xl tracking-tighter uppercase">IPTV Control</h2>
              </div>
              <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              <SidebarItem 
                icon={<Users size={18} />} 
                label="Visão Geral" 
                active={activeTab === 'dashboard'} 
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<PlusCircle size={18} />} 
                label="Cadastrar Cliente" 
                active={activeTab === 'cadastro'} 
                onClick={() => { setActiveTab('cadastro'); setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<Users size={18} />} 
                label="Meus Clientes" 
                active={activeTab === 'clientes'} 
                onClick={() => { setActiveTab('clientes'); setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<Calendar size={18} />} 
                label="Vencimentos" 
                active={activeTab === 'calendario'} 
                onClick={() => { setActiveTab('calendario'); setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<CreditCard size={18} />} 
                label="Créditos" 
                active={activeTab === 'creditos'} 
                onClick={() => { setActiveTab('creditos'); setIsSidebarOpen(false); }} 
              />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 ps-2 mb-6">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700 uppercase">
                  AD
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">Admin Root</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Membro Premium</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0B1120]">
        {/* Top Header Section (Shared) */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0F172A] hidden md:flex">
          <h1 className="text-lg font-semibold text-slate-200">
            {activeTab === 'dashboard' && 'Painel de Controle'}
            {activeTab === 'cadastro' && 'Cadastrar Novo Cliente'}
            {activeTab === 'clientes' && 'Listagem de Clientes'}
            {activeTab === 'calendario' && 'Calendário de Cobrança'}
            {activeTab === 'creditos' && 'Controle de Créditos'}
          </h1>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end border-r border-slate-800 pr-6">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Base de Clientes</span>
              <span className="text-lg font-bold text-blue-500">{clients.length}</span>
            </div>
            <button 
              onClick={() => setActiveTab('cadastro')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all text-sm shadow-lg shadow-blue-600/10 active:scale-95"
            >
              + Novo Cadastro
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard clients={clients} onNavigate={setActiveTab} />}
            {activeTab === 'cadastro' && <ClientForm onComplete={() => setActiveTab('clientes')} />}
            {activeTab === 'clientes' && <ClientList clients={clients} />}
            {activeTab === 'calendario' && <VencimentosCalendar clients={clients} />}
            {activeTab === 'creditos' && <Credits credits={credits} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}
