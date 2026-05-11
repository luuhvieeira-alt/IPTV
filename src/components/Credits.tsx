import React, { useState } from 'react';
import { CreditData } from '../App';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  Timestamp,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { 
  Plus, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Cpu, 
  TrendingUp, 
  Trash2,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditsProps {
  credits: CreditData[];
}

export function Credits({ credits }: CreditsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    quantity: '',
    serverName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value || !formData.quantity || !formData.serverName) return;

    try {
      await addDoc(collection(db, 'credits'), {
        date: Timestamp.fromDate(new Date(formData.date + 'T12:00:00')),
        value: parseFloat(formData.value),
        quantity: parseInt(formData.quantity),
        serverName: formData.serverName,
        ownerId: 'admin',
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        value: '',
        quantity: '',
        serverName: ''
      });
    } catch (error) {
      console.error("Erro ao salvar crédito:", error);
    }
  };

  const now = new Date();
  const currentMonthCredits = credits.filter(c => {
    const creditDate = c.date.toDate();
    return creditDate.getMonth() === now.getMonth() && creditDate.getFullYear() === now.getFullYear();
  });

  const totalInvestment = currentMonthCredits.reduce((acc, curr) => acc + curr.value, 0);
  const totalQuantity = currentMonthCredits.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-xl shadow-blue-500/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="text-blue-500" size={28} />
            Controle de Créditos
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Gerencie seus investimentos em painéis e servidores</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          {showForm ? 'CANCELAR' : 'NOVO CRÉDITO'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-emerald-500/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Investimento no Mês</span>
            <p className="text-3xl font-black text-emerald-400">R$ {totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-blue-500/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
            <Package size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Créditos Comprados</span>
            <p className="text-3xl font-black text-blue-400">{totalQuantity} <span className="text-sm font-bold text-slate-500 ml-1">unid.</span></p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-[#1E293B] p-8 rounded-2xl border border-slate-700 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Data da Compra
                  </label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Valor Investido (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} /> Quantidade de Créditos
                  </label>
                  <input 
                    type="number"
                    placeholder="Ex: 100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={14} /> Servidor / Painel
                  </label>
                  <input 
                    type="text"
                    placeholder="Nome do servidor"
                    value={formData.serverName}
                    onChange={(e) => setFormData({...formData, serverName: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-black transition-all shadow-lg shadow-emerald-600/20"
                >
                  SALVAR LANÇAMENTO
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-[#0B1120]/50">
          <h3 className="text-lg font-bold text-white tracking-tight">Histórico de Compras</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-black text-slate-500 tracking-[.2em]">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Servidor</th>
                <th className="px-6 py-4 text-center">Quantidade</th>
                <th className="px-6 py-4">Investimento</th>
                <th className="px-6 py-4">Pôr Crédito</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">Nenhum crédito lançado ainda.</td>
                </tr>
              ) : (
                credits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-300">
                      {format(credit.date.toDate(), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded text-[11px] font-black uppercase">
                        {credit.serverName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-blue-400">{credit.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-emerald-400">R$ {credit.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">
                        R$ {(credit.value / credit.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /und
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={async () => {
                          if (confirm('Deseja realmente excluir este lançamento?')) {
                            await deleteDoc(doc(db, 'credits', credit.id));
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
