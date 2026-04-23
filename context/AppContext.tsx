'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  usuarios as initialUsuarios,
  veterinarios as initialVets,
  mascotas as initialMascotas,
  servicios as initialServicios,
  citas as initialCitas,
  consultas as initialConsultas,
  Usuario, Veterinario, Mascota, Servicio, Cita, Consulta
} from '@/data/mockData';

interface AppState {
  usuarios: Usuario[];
  veterinarios: Veterinario[];
  mascotas: Mascota[];
  servicios: Servicio[];
  citas: Cita[];
  consultas: Consulta[];
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addCita: (cita: Omit<Cita, 'id'>) => void;
  updateCitaEstado: (id: string, estado: Cita['estado']) => void;
  addUsuario: (usuario: Omit<Usuario, 'id' | 'fechaRegistro'>) => void;
  addServicio: (servicio: Omit<Servicio, 'id'>) => void;
  updateServicio: (id: string, servicio: Partial<Servicio>) => void;
  deleteServicio: (id: string) => void;
  addMascota: (mascota: Omit<Mascota, 'id'>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [veterinarios] = useState<Veterinario[]>(initialVets);
  const [mascotas, setMascotas] = useState<Mascota[]>(initialMascotas);
  const [servicios, setServicios] = useState<Servicio[]>(initialServicios);
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [consultas] = useState<Consulta[]>(initialConsultas);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('caninocare_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const PASSWORDS: Record<string, string> = {
      'admin@caninocare.com': 'Canino2026*',
    };
    usuarios.forEach(u => { if (!PASSWORDS[u.email]) PASSWORDS[u.email] = 'Canino2026*'; });
    const user = usuarios.find(u => u.email === email);
    if (user && (PASSWORDS[email] === password || password === 'Canino2026*')) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('caninocare_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('caninocare_user');
  };

  const addCita = (cita: Omit<Cita, 'id'>) => {
    const newCita = { ...cita, id: `c${Date.now()}` };
    setCitas(prev => [...prev, newCita]);
  };

  const updateCitaEstado = (id: string, estado: Cita['estado']) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  };

  const addUsuario = (usuario: Omit<Usuario, 'id' | 'fechaRegistro'>) => {
    const newUser: Usuario = { ...usuario, id: `u${Date.now()}`, fechaRegistro: new Date().toISOString().split('T')[0] };
    setUsuarios(prev => [...prev, newUser]);
  };

  const addServicio = (servicio: Omit<Servicio, 'id'>) => {
    setServicios(prev => [...prev, { ...servicio, id: `s${Date.now()}` }]);
  };

  const updateServicio = (id: string, servicio: Partial<Servicio>) => {
    setServicios(prev => prev.map(s => s.id === id ? { ...s, ...servicio } : s));
  };

  const deleteServicio = (id: string) => {
    setServicios(prev => prev.filter(s => s.id !== id));
  };

  const addMascota = (mascota: Omit<Mascota, 'id'>) => {
    setMascotas(prev => [...prev, { ...mascota, id: `m${Date.now()}` }]);
  };

  return (
    <AppContext.Provider value={{
      usuarios, veterinarios, mascotas, servicios, citas, consultas,
      currentUser, isAuthenticated,
      login, logout, addCita, updateCitaEstado, addUsuario,
      addServicio, updateServicio, deleteServicio, addMascota
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
