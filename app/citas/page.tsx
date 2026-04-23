'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Calendar, Plus, X, Search, Filter, Clock } from 'lucide-react';
import { Cita } from '@/data/mockData';

type FilterEstado = 'todas' | Cita['estado'];

export default function CitasPage() {
  const { isAuthenticated, citas, mascotas, usuarios, veterinarios, servicios, addCita, updateCitaEstado, currentUser } = useApp();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterEstado>('todas');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    id_mascota: '', id_veterinario: '', id_servicio: '',
    fechaHora: '', observaciones: '', id_usuario: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const citasVisibles = (() => {
    if (!currentUser) return [];
    if (currentUser.rol === 'admin') return citas;
    if (currentUser.rol === 'veterinario') {
      const vet = veterinarios.find(v => v.id_usuario === currentUser.id);
      return vet ? citas.filter(c => c.id_veterinario === vet.id) : [];
    }
    const misMascotas = mascotas.filter(m => m.id_usuario === currentUser.id).map(m => m.id);
    return citas.filter(c => c.id_usuario === currentUser.id || misMascotas.includes(c.id_mascota));
  })();

  const mascotasDisponibles = currentUser?.rol === 'dueno'
    ? mascotas.filter(m => m.id_usuario === currentUser.id)
    : mascotas;

  const puedeAgendar = currentUser?.rol !== 'veterinario';

  const getVetUser = (vetId: string) => {
    const vet = veterinarios.find(v => v.id === vetId);
    return usuarios.find(u => u.id === vet?.id_usuario);
  };

  const getMascota = (id: string) => mascotas.find(m => m.id === id);
  const getServicio = (id: string) => servicios.find(s => s.id === id);
  const getDuenoName = (userId: string) => usuarios.find(u => u.id === userId)?.nombre || '—';

  const filteredCitas = citasVisibles.filter(c => {
    const matchFilter = filter === 'todas' || c.estado === filter;
    const mascota = getMascota(c.id_mascota);
    const matchSearch = !search ||
      mascota?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.servicio.toLowerCase().includes(search.toLowerCase()) ||
      getDuenoName(c.id_usuario).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }).sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.id_mascota) e.id_mascota = 'Selecciona una mascota';
    if (!form.id_veterinario) e.id_veterinario = 'Selecciona un veterinario';
    if (!form.id_servicio) e.id_servicio = 'Selecciona un servicio';
    if (!form.fechaHora) e.fechaHora = 'Ingresa fecha y hora';
    else if (new Date(form.fechaHora) < new Date()) e.fechaHora = 'La fecha debe ser futura';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const mascota = getMascota(form.id_mascota)!;
    const servicio = getServicio(form.id_servicio)!;
    addCita({
      id_mascota: form.id_mascota,
      id_veterinario: form.id_veterinario,
      id_usuario: mascota.id_usuario,
      fechaHora: form.fechaHora,
      servicio: servicio.nombre,
      id_servicio: form.id_servicio,
      estado: 'pendiente',
      observaciones: form.observaciones,
      monto: servicio.precioBase,
    });
    setForm({ id_mascota: '', id_veterinario: '', id_servicio: '', fechaHora: '', observaciones: '', id_usuario: '' });
    setShowForm(false);
  };

  const estadoBadgeClass = (e: string) => ({
    pendiente: 'badge badge-pending',
    confirmada: 'badge badge-confirmed',
    finalizada: 'badge badge-done',
    cancelada: 'badge badge-cancelled',
  }[e] || 'badge');

  const filterCounts = {
    todas: citasVisibles.length,
    pendiente: citasVisibles.filter(c => c.estado === 'pendiente').length,
    confirmada: citasVisibles.filter(c => c.estado === 'confirmada').length,
    finalizada: citasVisibles.filter(c => c.estado === 'finalizada').length,
    cancelada: citasVisibles.filter(c => c.estado === 'cancelada').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Citas</h1>
          <p className="text-slate-500 mt-1">Gestión de citas veterinarias</p>
        </div>
        {puedeAgendar && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Agendar cita
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por mascota, servicio o dueño..."
              className="input pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['todas', 'pendiente', 'confirmada', 'finalizada', 'cancelada'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({filterCounts[f]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Citas table */}
      <div className="card p-0 overflow-hidden">
        {filteredCitas.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay citas</p>
            <p className="text-sm mt-1">Cambia los filtros o agenda una nueva cita</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Fecha / Hora', 'Mascota', 'Servicio', 'Veterinario', 'Dueño', 'Estado', 'Monto', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCitas.map(cita => {
                  const mascota = getMascota(cita.id_mascota);
                  const vetUser = getVetUser(cita.id_veterinario);
                  return (
                    <tr key={cita.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{new Date(cita.fechaHora).toLocaleDateString('es-CO')}</p>
                            <p className="text-xs text-slate-400">{cita.fechaHora.split('T')[1]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{mascota?.nombre}</p>
                        <p className="text-xs text-slate-400">{mascota?.raza}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{cita.servicio}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{vetUser?.nombre}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{getDuenoName(cita.id_usuario)}</td>
                      <td className="px-4 py-3"><span className={estadoBadgeClass(cita.estado)}>{cita.estado}</span></td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">${cita.monto.toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {cita.estado === 'pendiente' && (
                            <button onClick={() => updateCitaEstado(cita.id, 'confirmada')} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg font-medium">
                              Confirmar
                            </button>
                          )}
                          {cita.estado === 'confirmada' && (
                            <button onClick={() => updateCitaEstado(cita.id, 'finalizada')} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded-lg font-medium">
                              Finalizar
                            </button>
                          )}
                          {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                            <button onClick={() => updateCitaEstado(cita.id, 'cancelada')} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded-lg font-medium">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-bold text-slate-800 text-lg">Agendar nueva cita</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mascota *</label>
                <select className="input" value={form.id_mascota} onChange={e => setForm(f => ({ ...f, id_mascota: e.target.value }))}>
                  <option value="">Seleccionar mascota</option>
                  {mascotasDisponibles.map(m => {
                    const dueno = usuarios.find(u => u.id === m.id_usuario);
                    return <option key={m.id} value={m.id}>{m.nombre} ({dueno?.nombre})</option>;
                  })}
                </select>
                {errors.id_mascota && <p className="text-red-500 text-xs mt-1">{errors.id_mascota}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Veterinario *</label>
                <select className="input" value={form.id_veterinario} onChange={e => setForm(f => ({ ...f, id_veterinario: e.target.value }))}>
                  <option value="">Seleccionar veterinario</option>
                  {veterinarios.map(v => {
                    const u = usuarios.find(u => u.id === v.id_usuario);
                    return <option key={v.id} value={v.id}>{u?.nombre} – {v.especialidad}</option>;
                  })}
                </select>
                {errors.id_veterinario && <p className="text-red-500 text-xs mt-1">{errors.id_veterinario}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Servicio *</label>
                <select className="input" value={form.id_servicio} onChange={e => setForm(f => ({ ...f, id_servicio: e.target.value }))}>
                  <option value="">Seleccionar servicio</option>
                  {servicios.filter(s => s.activo).map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} – ${s.precioBase.toLocaleString('es-CO')}</option>
                  ))}
                </select>
                {errors.id_servicio && <p className="text-red-500 text-xs mt-1">{errors.id_servicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha y hora *</label>
                <input type="datetime-local" className="input" value={form.fechaHora} onChange={e => setForm(f => ({ ...f, fechaHora: e.target.value }))} />
                {errors.fechaHora && <p className="text-red-500 text-xs mt-1">{errors.fechaHora}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="Notas adicionales..." value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Confirmar cita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
