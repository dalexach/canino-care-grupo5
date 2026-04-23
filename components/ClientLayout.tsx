'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, Calendar, FileText, Users, Settings,
  LogOut, Menu, X, PawPrint, ChevronRight, Bell
} from 'lucide-react';

import type { UserRole } from '@/data/mockData';

const allNavItems: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'veterinario', 'dueno'] },
  { href: '/citas', label: 'Citas', icon: Calendar, roles: ['admin', 'veterinario', 'dueno'] },
  { href: '/historial', label: 'Historial Clínico', icon: FileText, roles: ['admin', 'veterinario', 'dueno'] },
  { href: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  { href: '/admin', label: 'Administración', icon: Settings, roles: ['admin'] },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, logout, citas, mascotas, veterinarios } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const navItems = currentUser
    ? allNavItems.filter(item => item.roles.includes(currentUser.rol))
    : [];

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
  const pendingCitas = citasVisibles.filter(c => c.estado === 'pendiente').length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
              <PawPrint size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-none">CaninoCare</h1>
              <p className="text-xs text-slate-400 mt-0.5">Gestión Veterinaria</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${pathname === href ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === '/citas' && pendingCitas > 0 && (
                <span className="ml-auto bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCitas}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">{currentUser?.nombre.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.nombre}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser?.rol}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-4 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>CaninoCare</span>
            <ChevronRight size={14} />
            <span className="text-slate-700 font-medium capitalize">
              {navItems.find(n => n.href === pathname)?.label || 'Página'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {pendingCitas > 0 && (
              <Link
                href="/citas"
                aria-label={`${pendingCitas} cita(s) pendiente(s)`}
                title={`${pendingCitas} cita(s) pendiente(s)`}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-500" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-amber-400 text-white text-xs flex items-center justify-center rounded-full font-bold">{pendingCitas}</span>
              </Link>
            )}
            <span className="text-sm text-slate-500 hidden md:block">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fadein">
          {children}
        </main>
      </div>
    </div>
  );
}
