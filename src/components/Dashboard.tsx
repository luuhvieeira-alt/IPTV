import { ClientData } from '../App';
import { Users, AlertTriangle, CheckCircle2, Calendar as CalendarIcon, TrendingUp, PlusCircle, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { isAfter, isBefore, addDays, startOfDay } from 'date-fns';

interface DashboardProps {
  clients: ClientData[];
  onNavigate: (tab: 'dashboard' | 'cadastro' | 'clientes' | 'calendario') => void;
}

export function Dashboard({ clients, onNavigate }: DashboardProps) {
  const activeClients = clients.filter(c => c.status === 'Ativo');
  
  const today = startOfDay(new Date());
  const expiringSoon = clients.filter(c => {
    const expDate = c.expirationDate.toDate();
    return isAfter(expDate, today) && isBefore(expDate, addDays(today, 5));
  });

  const expired = clients.filter(c => isBefore(c.expirationDate.toDate(), today));
  
  const monthlyRevenue = activeClients.reduce((acc, curr) => acc + (curr.monthlyValue || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="md:hidden">
        <h1 className="text-3xl font-bold">Resumo Geral</h1>
        <p className="text-slate-400 text-sm">Acompanhe seu sistema IPTV em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<DollarSign className="text-emerald-400" />} 
          title="Faturamento Mensal" 
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          bgColor="bg-emerald-500/10"
        />
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          title="Total Clientes" 
          value={clients.length.toString()} 
          bgColor="bg-blue-500/10"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-400" />} 
          title="Assinantes Ativos" 
          value={activeClients.length.toString()} 
          bgColor="bg-green-500/10"
        />
        <StatCard 
          icon={<AlertTriangle className="text-red-400" />} 
          title="Vencidos" 
          value={expired.length.toString()} 
          bgColor="bg-red-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Vencimentos (Próximos 5 dias)</h2>
            <button 
              onClick={() => onNavigate('calendario')}
              className="text-slate-400 text-[10px] uppercase font-bold hover:text-white transition-colors"
            >
              Exibir Tudo
            </button>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            {expiringSoon.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Sistema estável. Sem vencimentos urgentes.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {expiringSoon.map((client) => (
                  <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-default">
                    <div>
                      <p className="font-bold text-slate-200">{client.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{client.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-yellow-400 font-bold">
                        {client.expirationDate.toDate().toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Expira em breve</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Ações Operacionais</h2>
          <div className="space-y-3">
            <QuickAction 
              icon={<PlusCircleIcon />} 
              label="Novo Cadastro" 
              onClick={() => onNavigate('cadastro')}
            />
            <QuickAction 
              icon={<UsersIcon />} 
              label="Base de Dados" 
              onClick={() => onNavigate('clientes')}
            />
            <QuickAction 
              icon={<CalendarIconIcon />} 
              label="Calendário Financeiro" 
              onClick={() => onNavigate('calendario')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bgColor }: { icon: any, title: string, value: string, bgColor: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 flex items-center gap-4 shadow-xl shadow-black/30"
    >
      <div className={`p-3 rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tighter text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-[#1E293B] border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:border-blue-500/50 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg group"
    >
      <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

// Minimal versions of icons for QuickAction
const PlusCircleIcon = () => <PlusCircle size={20} />;
const UsersIcon = () => <Users size={20} />;
const CalendarIconIcon = () => <CalendarIcon size={20} />;
