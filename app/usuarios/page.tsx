'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Users, Plus, X, Search, UserCheck, PawPrint, Stethoscope, Shield } from 'lucide-react';
import { UserRole } from '@/data/mockData';

export default function UsuariosPage() {
  const { isAuthenticated, usuarios, mascotas, addUsuario, addMascota, currentUser } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<'todos' | UserRole>('todos');
  const [showForm, setShowForm] = useState(false);
  const [showMascotaForm, setShowMascotaForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', rol: 'dueno' as UserRole });
  const [mascotaForm, setMascotaForm] = useState({ id_usuario: '', nombre: '', raza: '', fechaNacimiento: '', pesoActual: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mErrors, setMErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (currentUser && currentUser.rol !== 'admin') router.push('/');
  }, [isAuthenticated, currentUser, router]);
  if (!isAuthenticated || currentUser?.rol !== 'admin') return null;

  const filtered = usuarios.filter(u => {
    const matchRol = rolFilter === 'todos' || u.rol === rolFilter;
    const matchSearch = !search || u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRol && matchSearch;
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email.trim()) e.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    else if (usuarios.some(u => u.email === form.email)) e.email = 'Email ya registrado';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateMascota = () => {
    const e: Record<string, string> = {};
    if (!mascotaForm.id_usuario) e.id_usuario = 'Selecciona el dueño';
    if (!mascotaForm.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!mascotaForm.raza.trim()) e.raza = 'La raza es requerida';
    if (mascotaForm.pesoActual && parseFloat(mascotaForm.pesoActual) <= 0) e.pesoActual = 'Peso inválido';
    setMErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addUsuario({ nombre: form.nombre, email: form.email, telefono: form.telefono, rol: form.rol, activo: true });
    setForm({ nombre: '', email: '', telefono: '', rol: 'dueno' });
    setShowForm(false);
  };

  const handleMascotaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMascota()) return;
    addMascota({
      id_usuario: mascotaForm.id_usuario,
      nombre: mascotaForm.nombre,
      raza: mascotaForm.raza,
      fechaNacimiento: mascotaForm.fechaNacimiento,
      pesoActual: parseFloat(mascotaForm.pesoActual) || 0,
    });
    setMascotaForm({ id_usuario: '', nombre: '', raza: '', fechaNacimiento: '', pesoActual: '' });
    setShowMascotaForm(false);
  };

  const getRolIcon = (rol: UserRole) => {
    if (rol === 'admin') return <Shield size={14} className="text-purple-600" />;
    if (rol === 'veterinario') return <Stethoscope size={14} className="text-blue-600" />;
    return <PawPrint size={14} className="text-emerald-600" />;
  };

  const getRolBg = (rol: UserRole) => ({
    admin: 'bg-purple-100 text-purple-700',
    veterinario: 'bg-blue-100 text-blue-700',
    dueno: 'bg-emerald-100 text-emerald-700',
  }[rol]);

  const duenos = usuarios.filter(u => u.rol === 'dueno');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500 mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMascotaForm(true)} className="btn-secondary flex items-center gap-2">
            <PawPrint size={16} /> Registrar mascota
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Dueños', count: duenos.length, icon: PawPrint, color: 'emerald' },
          { label: 'Veterinarios', count: usuarios.filter(u => u.rol === 'veterinario').length, icon: Stethoscope, color: 'blue' },
          { label: 'Administradores', count: usuarios.filter(u => u.rol === 'admin').length, icon: Shield, color: 'purple' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
              <Icon size={18} className={`text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar por nombre o email..." className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['todos', 'dueno', 'veterinario', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setRolFilter(r)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${rolFilter === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {r === 'dueno' ? 'Dueños' : r === 'veterinario' ? 'Veterinarios' : r === 'admin' ? 'Admins' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Usuario', 'Email', 'Teléfono', 'Rol', 'Mascotas', 'Registro'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => {
                const userMascotas = mascotas.filter(m => m.id_usuario === u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">{u.nombre.charAt(0)}</span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">{u.nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.telefono}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getRolBg(u.rol)} flex items-center gap-1 w-fit`}>
                        {getRolIcon(u.rol)} <span className="capitalize">{u.rol}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {userMascotas.length > 0 ? (
                        <span className="text-sm text-slate-700">{userMascotas.map(m => m.nombre).join(', ')}</span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(u.fechaRegistro).toLocaleDateString('es-CO')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo usuario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Registrar usuario</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Nombre completo *', key: 'nombre', type: 'text', placeholder: 'Nombre del usuario' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'correo@email.com' },
                { label: 'Teléfono *', key: 'telefono', type: 'tel', placeholder: '300 000 0000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <input type={type} className="input" placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rol *</label>
                <select className="input" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as UserRole }))}>
                  <option value="dueno">Dueño de mascota</option>
                  <option value="veterinario">Veterinario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal mascota */}
      {showMascotaForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Registrar mascota</h2>
              <button onClick={() => setShowMascotaForm(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleMascotaSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dueño *</label>
                <select className="input" value={mascotaForm.id_usuario} onChange={e => setMascotaForm(f => ({ ...f, id_usuario: e.target.value }))}>
                  <option value="">Seleccionar dueño</option>
                  {duenos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                {mErrors.id_usuario && <p className="text-red-500 text-xs mt-1">{mErrors.id_usuario}</p>}
              </div>
              {[
                { label: 'Nombre de la mascota *', key: 'nombre', type: 'text', placeholder: 'Ej: Max' },
                { label: 'Raza *', key: 'raza', type: 'text', placeholder: 'Ej: Labrador Retriever' },
                { label: 'Fecha de nacimiento', key: 'fechaNacimiento', type: 'date', placeholder: '' },
                { label: 'Peso actual (kg)', key: 'pesoActual', type: 'number', placeholder: 'Ej: 12.5' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <input type={type} step="0.1" className="input" placeholder={placeholder}
                    value={mascotaForm[key as keyof typeof mascotaForm]}
                    onChange={e => setMascotaForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  {mErrors[key] && <p className="text-red-500 text-xs mt-1">{mErrors[key]}</p>}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMascotaForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Registrar mascota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
