import { useState } from 'react';
import { ClientData } from '../App';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, User, AlertCircle, Phone, DollarSign, Calendar, Award, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VencimentosCalendarProps {
  clients: ClientData[];
}

export function VencimentosCalendar({ clients }: VencimentosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getClientsForDay = (day: Date) => {
    return clients.filter(c => isSameDay(c.expirationDate.toDate(), day));
  };

  const selectedDayClients = selectedDate ? getClientsForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="md:hidden">
        <h1 className="text-3xl font-bold">Calendário de Vencimentos</h1>
        <p className="text-slate-400">Acompanhe as datas de pagamento mensais.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Core */}
        <div className="xl:col-span-2 bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-[#0F172A]">
            <h2 className="text-xs font-bold uppercase tracking-[.2em] text-blue-400">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800"
              >
                Hoje
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="p-4 bg-[#0B1120]">
            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                const dayClients = getClientsForDay(day);
                const hasClients = dayClients.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative aspect-square md:aspect-[5/4] p-2 rounded-lg transition-all border
                      ${!isCurrentMonth ? 'opacity-10' : 'opacity-100'}
                      ${isSelected ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/20' : 'bg-[#1E293B] border-slate-800 hover:border-slate-600'}
                      ${isToday(day) && !isSelected ? 'border-blue-500/50 ring-1 ring-blue-500/30' : ''}
                    `}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'} ${isToday(day) && !isSelected ? 'text-blue-400' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {hasClients && (
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        <div className={`h-1 w-4 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-4">
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-6 shadow-2xl h-fit">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-1">Status Operacional</h3>
              <p className="text-lg font-bold text-white capitalize">
                {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="space-y-3">
              {selectedDayClients.length > 0 ? (
                selectedDayClients.map(client => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="p-4 bg-[#0B1120] rounded-lg border border-slate-800 flex items-center gap-4 hover:border-blue-500/50 hover:bg-[#1E293B] transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center text-blue-500 shrink-0 font-bold border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-100 truncate group-hover:text-blue-400">{client.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{client.plan}</p>
                        <span className="text-[10px] text-emerald-400 font-bold">R$ {client.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-600 flex flex-col items-center">
                  <AlertCircle size={32} className="mb-3 opacity-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">Sem atividades</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-800">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[.2em] mb-3">Protocolo de Cobrança</h4>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Para otimizar a taxa de renovação, inicie o contato com o cliente 48 horas antes do prazo limite expirar."
            </p>
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden shadow-blue-500/10"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 border-b border-slate-700 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/20 border border-blue-400/30">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{selectedClient.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-widest leading-none">
                        {selectedClient.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <DollarSign size={12} className="text-emerald-500" /> Valor Pago
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      R$ {selectedClient.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Calendar size={12} className="text-blue-500" /> Plano Contratado
                    </span>
                    <span className="text-lg font-bold text-white">
                      {selectedClient.plan}
                    </span>
                  </div>
                </div>

                {selectedClient.serverName && (
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                       Servidor
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      {selectedClient.serverName}
                    </span>
                  </div>
                )}

                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Phone size={14} className="text-indigo-400" /> WhatsApp / Tel
                    </span>
                    <span className="text-slate-100 font-mono font-medium">
                      {selectedClient.phone || '(00) 00000-0000'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Award size={14} className="text-purple-400" /> Pontos de Fidelidade
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                      <span className="text-purple-400 text-sm font-black">{selectedClient.points}</span>
                      <span className="text-[9px] font-bold text-purple-400/60 uppercase">pts</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (selectedClient.phone) {
                      const cleanPhone = selectedClient.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                    }
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                  COBRAR PELO WHATSAPP
                </button>

                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-[.15em]">
                  Referência: Expira em {format(selectedClient.expirationDate.toDate(), "dd/MM/yyyy")}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
