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
import { ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VencimentosCalendarProps {
  clients: ClientData[];
}

export function VencimentosCalendar({ clients }: VencimentosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
                    className="p-4 bg-[#0B1120] rounded-lg border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center text-blue-500 shrink-0 font-bold border border-blue-500/20">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-100 truncate">{client.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{client.plan}</p>
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
    </div>
  );
}
