'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Calendar, Users, PawPrint, TrendingUp, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, citas, mascotas, usuarios, veterinarios, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

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

  const mascotasVisibles = currentUser?.rol === 'dueno'
    ? mascotas.filter(m => m.id_usuario === currentUser.id)
    : mascotas;

  const today = new Date().toISOString().split('T')[0];
  const citasHoy = citasVisibles.filter(c => c.fechaHora.startsWith(today));
  const citasPendientes = citasVisibles.filter(c => c.estado === 'pendiente');
  const citasConfirmadas = citasVisibles.filter(c => c.estado === 'confirmada');
  const duenos = usuarios.filter(u => u.rol === 'dueno');
  const ingresosMes = citasVisibles.filter(c => c.estado === 'finalizada').reduce((sum, c) => sum + c.monto, 0);
  const esAdmin = currentUser?.rol === 'admin';

  const getVetName = (id: string) => {
    const vet = veterinarios.find(v => v.id === id);
    const user = usuarios.find(u => u.id === vet?.id_usuario);
    return user?.nombre || 'Sin asignar';
  };

  const getMascotaName = (id: string) => mascotas.find(m => m.id === id)?.nombre || 'N/A';

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: 'badge badge-pending',
      confirmada: 'badge badge-confirmed',
      finalizada: 'badge badge-done',
      cancelada: 'badge badge-cancelled',
    };
    return <span className={map[estado] || 'badge'}>{estado}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Buenos días, {currentUser?.nombre.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, color: 'blue', label: 'Citas hoy', value: citasHoy.length, sub: `${citasConfirmadas.length} confirmadas` },
          { icon: Clock, color: 'amber', label: 'Pendientes', value: citasPendientes.length, sub: 'Requieren confirmación' },
          { icon: PawPrint, color: 'emerald', label: 'Mascotas', value: mascotasVisibles.length, sub: esAdmin ? `${duenos.length} dueños` : 'Registradas' },
          ...(esAdmin ? [{ icon: TrendingUp, color: 'purple', label: 'Ingresos', value: '$' + (ingresosMes / 1000).toFixed(0) + 'k', sub: 'Citas finalizadas' }] : []),
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <span className="text-2xl font-bold text-slate-800">{value}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Citas de hoy</h2>
            <Link href="/citas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          {citasHoy.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasHoy.map(cita => (
                <div key={cita.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div className="text-center min-w-[52px]">
                    <p className="text-sm font-bold text-blue-600">{cita.fechaHora.split('T')[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{getMascotaName(cita.id_mascota)}</p>
                    <p className="text-xs text-slate-500">{cita.servicio} · {getVetName(cita.id_veterinario)}</p>
                  </div>
                  {estadoBadge(cita.estado)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-slate-800 mb-4">Alertas</h2>
            <div className="space-y-3">
              {citasPendientes.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">{citasPendientes.length} cita(s) pendiente(s)</p>
                    <p className="text-xs text-amber-600">Requieren confirmación</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <CheckCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Sistema operativo</p>
                  <p className="text-xs text-blue-600">Disponibilidad 99.8%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-slate-800 mb-4">Acceso rápido</h2>
            <div className="space-y-2">
              {[
                { href: '/citas', label: currentUser?.rol === 'veterinario' ? 'Mis citas' : 'Nueva cita', icon: Calendar, color: 'blue', roles: ['admin', 'veterinario', 'dueno'] as const },
                { href: '/historial', label: 'Historial clínico', icon: PawPrint, color: 'emerald', roles: ['admin', 'veterinario', 'dueno'] as const },
                { href: '/usuarios', label: 'Registrar usuario', icon: Users, color: 'purple', roles: ['admin'] as const },
              ].filter(item => currentUser && (item.roles as readonly string[]).includes(currentUser.rol)).map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                  <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={`text-${color}-600`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
