import { useState } from 'react';
import { ClientData } from '../App';
import { Search, Edit2, Trash2, Phone, Calendar, Info, Filter, ExternalLink, Cpu, AppWindow, ShieldCheck, Hash } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ClientForm } from './ClientForm';
import { format, isBefore, startOfDay } from 'date-fns';

interface ClientListProps {
  clients: ClientData[];
}

export function ClientList({ clients }: ClientListProps) {
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const today = startOfDay(new Date());

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.whatsapp.includes(search);
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (editingClient) {
    return (
      <ClientForm 
        editClient={editingClient} 
        onComplete={() => setEditingClient(null)} 
        onCancel={() => setEditingClient(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:hidden">Meus Clientes</h1>
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400">Banco de Dados</h2>
          <p className="text-slate-400 text-xs mt-1">{filtered.length} Clientes registrados</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Localizar registro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E293B] border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all w-full sm:w-64 placeholder:text-slate-600"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1E293B] border border-slate-700 rounded-lg pl-11 pr-8 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none uppercase font-bold tracking-wider text-slate-400"
            >
              <option value="all">Filtro: Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((client) => {
            const isExpired = isBefore(client.expirationDate.toDate(), today);
            
            return (
              <motion.div 
                key={client.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all group shadow-xl"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-[#0B1120] border border-slate-800 rounded flex items-center justify-center text-blue-500">
                      <span className="font-black text-sm">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingClient(client)}
                        className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-base leading-tight truncate text-slate-100">{client.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          isExpired 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {isExpired ? 'Expirado' : client.status}
                        </span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {client.plan}
                        </span>
                        {client.points > 1 && (
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                            <Hash size={8} /> {client.points}
                          </span>
                        )}
                      </div>
                    </div>

                    {client.hasBackupServer && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded p-2 mt-1">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1.5 overflow-hidden">
                          <ShieldCheck size={10} className="shrink-0" /> 
                          <span className="truncate">Reserva: {client.backupServerName || 'Não informado'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                          <div className="flex items-center gap-1 min-w-0">
                            <User size={8} className="text-slate-600 shrink-0" />
                            <span className="truncate">Login: {client.backupLogin || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto shrink-0">
                            <Calendar size={8} className="text-slate-600 shrink-0" />
                            <span className="font-mono">Vence: {client.backupExpirationDate ? format(client.backupExpirationDate.toDate(), 'dd/MM/yy') : '-'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 py-1 pt-2 border-t border-slate-800/50">
                      {client.devices?.map((device, idx) => (
                        <div key={idx} className="bg-[#0B1120]/40 p-2 rounded border border-slate-800/50">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 overflow-hidden">
                             <div className="w-3 h-3 bg-slate-800 rounded flex items-center justify-center text-[8px] text-blue-400 border border-slate-700 shrink-0">
                               {idx + 1}
                             </div>
                             <AppWindow size={10} className="shrink-0" />
                             <span className="truncate">{device.appName || 'App'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <Cpu size={10} className="text-slate-600 shrink-0" />
                            <span className="truncate">{device.macAddress}</span>
                            {device.macPassword && (
                              <div className="ml-auto flex items-center gap-1 text-slate-600">
                                <Key size={8} />
                                <span>{device.macPassword}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 py-1 pt-2 border-t border-slate-800/50">
                       <a 
                        href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Phone size={12} />
                        <span>{client.whatsapp}</span>
                        <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} />
                        <span className="font-mono">Vence: {format(client.expirationDate.toDate(), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>

                    {client.notes && (
                      <div className="bg-[#0B1120] p-2.5 rounded border border-slate-800">
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                          {client.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 text-slate-600 border border-slate-800 bg-[#1E293B]/50 rounded-xl">
          <Info size={40} className="mb-4 opacity-10" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum dado encontrado</p>
          <p className="text-xs">Sincronize sua base de dados ou tente outra busca.</p>
        </div>
      )}
    </div>
  );
}
