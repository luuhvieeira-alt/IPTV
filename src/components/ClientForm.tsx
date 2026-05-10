import { useState, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Save, X, Phone, User, Package, Calendar, StickyNote, Hash, DollarSign, AppWindow, Cpu, Key, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientData } from '../App';

interface ClientFormProps {
  editClient?: ClientData | null;
  onComplete: () => void;
  onCancel?: () => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function ClientForm({ editClient, onComplete, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editClient?.name || '',
    whatsapp: editClient?.whatsapp || '',
    plan: editClient?.plan || 'Mensal',
    status: editClient?.status || 'Ativo',
    points: editClient?.points || 1,
    monthlyValue: editClient?.monthlyValue || 0,
    devices: editClient?.devices || [{ appName: '', macAddress: '', macPassword: '' }],
    hasBackupServer: editClient?.hasBackupServer || false,
    backupServerName: editClient?.backupServerName || '',
    backupLogin: editClient?.backupLogin || '',
    backupExpirationDate: editClient?.backupExpirationDate?.toDate().toISOString().split('T')[0] || '',
    expirationDate: editClient?.expirationDate.toDate().toISOString().split('T')[0] || '',
    notes: editClient?.notes || ''
  });

  const handlePointsChange = (val: number) => {
    const points = Math.max(1, Math.min(10, val));
    const currentDevices = [...formData.devices];
    
    if (points > currentDevices.length) {
      // Add new devices
      for (let i = currentDevices.length; i < points; i++) {
        currentDevices.push({ appName: '', macAddress: '', macPassword: '' });
      }
    } else if (points < currentDevices.length) {
      // Remove extra devices
      currentDevices.splice(points);
    }
    
    setFormData({ ...formData, points, devices: currentDevices });
  };

  const handleDeviceChange = (index: number, field: string, value: string) => {
    const newDevices = [...formData.devices];
    newDevices[index] = { ...newDevices[index], [field]: value };
    setFormData({ ...formData, devices: newDevices });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const path = 'clients';
    
    try {
      const payload = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        plan: formData.plan,
        status: formData.status as 'Ativo' | 'Pendente' | 'Inativo',
        points: Number(formData.points),
        monthlyValue: Number(formData.monthlyValue),
        devices: formData.devices,
        hasBackupServer: formData.hasBackupServer,
        backupServerName: formData.hasBackupServer ? formData.backupServerName : '',
        backupLogin: formData.hasBackupServer ? formData.backupLogin : '',
        backupExpirationDate: formData.hasBackupServer && formData.backupExpirationDate 
          ? Timestamp.fromDate(new Date(formData.backupExpirationDate + 'T12:00:00')) 
          : null,
        expirationDate: Timestamp.fromDate(new Date(formData.expirationDate + 'T12:00:00')),
        notes: formData.notes,
        ownerId: 'admin',
        updatedAt: serverTimestamp(),
      };

      if (editClient) {
        await updateDoc(doc(db, path, editClient.id), payload);
      } else {
        await addDoc(collection(db, path), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      onComplete();
    } catch (error) {
      handleFirestoreError(error, editClient ? OperationType.UPDATE : OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-[#1E293B] rounded-xl border border-slate-700 p-6 md:p-10 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1">
            {editClient ? 'Atualização Cadastral' : 'Novo Registro'}
          </h2>
          <p className="text-xl font-bold">{editClient ? 'Editar Cliente' : 'Cadastrar Cliente'}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-500 hover:text-white p-2 transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          icon={<User size={16} />}
          label="Nome Completo"
          placeholder="Ex: Ricardo Oliveira"
          value={formData.name}
          onChange={(v) => setFormData({...formData, name: v})}
          required
        />
        
        <Input 
          icon={<Phone size={16} />}
          label="WhatsApp"
          placeholder="Ex: (11) 98822-1100"
          value={formData.whatsapp}
          onChange={(v) => setFormData({...formData, whatsapp: v})}
          required
        />

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Hash size={14} /> Pontos / Telas
          </label>
          <input 
            type="number"
            required
            min={1}
            max={10}
            value={formData.points}
            onChange={(e) => handlePointsChange(parseInt(e.target.value) || 1)}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <DollarSign size={14} /> Valor Mensal (R$)
          </label>
          <input 
            type="number"
            required
            step="0.01"
            value={formData.monthlyValue}
            onChange={(e) => setFormData({...formData, monthlyValue: parseFloat(e.target.value) || 0})}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all font-bold"
          />
        </div>

        {/* Dynamic Device Sections */}
        <div className="md:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {formData.devices.map((device, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0B1120]/40 p-5 rounded-xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded text-[10px] flex items-center justify-center font-black">
                    {index + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Dados do Ponto {index + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <AppWindow size={12} /> App
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Smart Up"
                      value={device.appName}
                      onChange={(e) => handleDeviceChange(index, 'appName', e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Cpu size={12} /> MAC
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="00:00:00:00:00"
                      value={device.macAddress}
                      onChange={(e) => handleDeviceChange(index, 'macAddress', e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Key size={12} /> Senha MAC
                    </label>
                    <input 
                      type="text"
                      placeholder="Opcional"
                      value={device.macPassword}
                      onChange={(e) => handleDeviceChange(index, 'macPassword', e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Package size={14} /> Pacote Selecionado
          </label>
          <select 
            value={formData.plan}
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none"
          >
            <option value="Mensal">Mensal</option>
            <option value="2 Meses">2 Meses</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> Data Limite
          </label>
          <input 
            type="date"
            required
            value={formData.expirationDate}
            onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]"
          />
        </div>

        <div className="md:col-span-2 py-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox"
                checked={formData.hasBackupServer}
                onChange={(e) => setFormData({...formData, hasBackupServer: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 flex items-center gap-2">
              <ShieldCheck size={14} /> Servidor Reserva
            </span>
          </label>
        </div>

        <AnimatePresence>
          {formData.hasBackupServer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:col-span-2 overflow-hidden"
            >
              <div className="bg-[#0B1120]/50 border border-blue-500/20 rounded-lg p-4 mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                       Nome do Servidor Reserva
                    </label>
                    <input 
                      type="text"
                      required={formData.hasBackupServer}
                      placeholder="Ex: Servidor X"
                      value={formData.backupServerName}
                      onChange={(e) => setFormData({...formData, backupServerName: e.target.value})}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                       Login Reserva
                    </label>
                    <input 
                      type="text"
                      required={formData.hasBackupServer}
                      placeholder="Login de acesso"
                      value={formData.backupLogin}
                      onChange={(e) => setFormData({...formData, backupLogin: e.target.value})}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <Calendar size={14} /> Vencimento do Reserva
                  </label>
                  <input 
                    type="date"
                    required={formData.hasBackupServer}
                    value={formData.backupExpirationDate}
                    onChange={(e) => setFormData({...formData, backupExpirationDate: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <StickyNote size={14} /> Notas Adicionais
          </label>
          <textarea 
            placeholder="Observações técnicas ou credenciais..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-700"
          />
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                <span>Efetuar Cadastro</span>
              </>
            )}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded text-sm uppercase tracking-widest active:scale-95 transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

function Input({ icon, label, placeholder, value, onChange, required }: { icon: any, label: string, placeholder: string, value: string, onChange: (v: string) => void, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
      />
    </div>
  );
}
