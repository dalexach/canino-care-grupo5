'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Settings, Plus, Edit2, Trash2, X, TrendingUp, DollarSign, BarChart3, CheckCircle } from 'lucide-react';
import { Servicio } from '@/data/mockData';

export default function AdminPage() {
  const { isAuthenticated, servicios, citas, addServicio, updateServicio, deleteServicio, currentUser } = useApp();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precioBase: '', duracionMin: '', categoria: '', activo: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (currentUser && currentUser.rol !== 'admin') router.push('/');
  }, [isAuthenticated, currentUser, router]);
  if (!isAuthenticated || currentUser?.rol !== 'admin') return null;

  const citasFinalizadas = citas.filter(c => c.estado === 'finalizada');
  const ingresoTotal = citasFinalizadas.reduce((sum, c) => sum + c.monto, 0);
  const ingresoPromedio = citasFinalizadas.length > 0 ? ingresoTotal / citasFinalizadas.length : 0;

  const servicioStats = servicios.map(s => {
    const citasServicio = citas.filter(c => c.id_servicio === s.id && c.estado === 'finalizada');
    return { ...s, count: citasServicio.length, ingresos: citasServicio.reduce((sum, c) => sum + c.monto, 0) };
  }).sort((a, b) => b.count - a.count);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.precioBase || parseFloat(form.precioBase) < 0) e.precioBase = 'Precio inválido';
    if (!form.duracionMin || parseInt(form.duracionMin) <= 0) e.duracionMin = 'Duración inválida';
    if (!form.categoria.trim()) e.categoria = 'La categoría es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      nombre: form.nombre, descripcion: form.descripcion,
      precioBase: parseFloat(form.precioBase),
      duracionMin: parseInt(form.duracionMin),
      categoria: form.categoria, activo: form.activo,
    };
    if (editId) { updateServicio(editId, data); setEditId(null); }
    else addServicio(data);
    setForm({ nombre: '', descripcion: '', precioBase: '', duracionMin: '', categoria: '', activo: true });
    setShowForm(false);
  };

  const openEdit = (s: Servicio) => {
    setForm({ nombre: s.nombre, descripcion: s.descripcion, precioBase: String(s.precioBase), duracionMin: String(s.duracionMin), categoria: s.categoria, activo: s.activo });
    setEditId(s.id);
    setShowForm(true);
  };

  const categorias = Array.from(new Set(servicios.map(s => s.categoria)));
  const maxCount = Math.max(...servicioStats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Administración</h1>
        <p className="text-slate-500 mt-1">Gestión de servicios y reportes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos totales', value: `$${ingresoTotal.toLocaleString('es-CO')}`, icon: DollarSign, color: 'emerald', sub: `${citasFinalizadas.length} citas` },
          { label: 'Ingreso promedio', value: `$${Math.round(ingresoPromedio).toLocaleString('es-CO')}`, icon: TrendingUp, color: 'blue', sub: 'Por cita finalizada' },
          { label: 'Servicios activos', value: servicios.filter(s => s.activo).length, icon: CheckCircle, color: 'purple', sub: `de ${servicios.length} totales` },
          { label: 'Servicio top', value: servicioStats[0]?.nombre.split(' ')[0] || '—', icon: BarChart3, color: 'amber', sub: `${servicioStats[0]?.count || 0} citas` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className="text-xl font-bold text-slate-800 truncate">{value}</p>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Servicios */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Catálogo de servicios</h2>
            <button onClick={() => { setEditId(null); setForm({ nombre: '', descripcion: '', precioBase: '', duracionMin: '', categoria: '', activo: true }); setShowForm(true); }} className="btn-primary flex items-center gap-1 py-2 px-3 text-xs">
              <Plus size={14} /> Agregar
            </button>
          </div>
          <div className="space-y-3">
            {servicios.map(s => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${s.activo ? 'border-slate-100 bg-white hover:border-blue-100' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 text-sm truncate">{s.nombre}</p>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{s.categoria}</span>
                    {!s.activo && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Inactivo</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{s.descripcion}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs font-semibold text-emerald-600">${s.precioBase.toLocaleString('es-CO')}</span>
                    <span className="text-xs text-slate-400">{s.duracionMin} min</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(s.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reporte */}
        <div className="card">
          <h2 className="font-bold text-slate-800 mb-4">Reporte de ingresos por servicio</h2>
          <div className="space-y-4">
            {servicioStats.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{s.nombre}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">${s.ingresos.toLocaleString('es-CO')}</span>
                    <span className="text-xs text-slate-400 ml-2">({s.count} citas)</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-3">Distribución por estado</h3>
            {(['pendiente', 'confirmada', 'finalizada', 'cancelada'] as const).map(estado => {
              const count = citas.filter(c => c.estado === estado).length;
              const pct = citas.length > 0 ? (count / citas.length * 100).toFixed(0) : '0';
              const colorMap = { pendiente: 'bg-amber-400', confirmada: 'bg-blue-500', finalizada: 'bg-emerald-500', cancelada: 'bg-red-400' };
              return (
                <div key={estado} className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${colorMap[estado]}`} />
                  <span className="text-sm text-slate-600 capitalize flex-1">{estado}</span>
                  <span className="text-sm font-semibold text-slate-800">{count}</span>
                  <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal servicio */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-bold text-slate-800 text-lg">{editId ? 'Editar' : 'Nuevo'} servicio</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Nombre *', key: 'nombre', type: 'text', placeholder: 'Ej: Consulta General' },
                { label: 'Precio base (COP) *', key: 'precioBase', type: 'number', placeholder: 'Ej: 65000' },
                { label: 'Duración estimada (min) *', key: 'duracionMin', type: 'number', placeholder: 'Ej: 30' },
                { label: 'Categoría *', key: 'categoria', type: 'text', placeholder: 'Ej: Medicina, Estética, Cirugía' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <input type={type} className="input" placeholder={placeholder}
                    value={form[key as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
                <textarea className="input min-h-[70px] resize-none" placeholder="Descripción del servicio..."
                  value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="activo" className="text-sm font-medium text-slate-700">Servicio activo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editId ? 'Guardar cambios' : 'Crear servicio'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg mb-2">¿Eliminar servicio?</h2>
            <p className="text-slate-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => { deleteServicio(confirmDelete); setConfirmDelete(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
