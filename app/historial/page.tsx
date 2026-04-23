'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PawPrint, FileText, Upload, ChevronDown, ChevronUp, Search, Pill, Stethoscope, Paperclip } from 'lucide-react';

export default function HistorialPage() {
  const { isAuthenticated, mascotas, consultas, citas, usuarios, veterinarios, currentUser } = useApp();
  const router = useRouter();
  const [selectedMascota, setSelectedMascota] = useState('');
  const [expandedConsulta, setExpandedConsulta] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [simulatedFiles, setSimulatedFiles] = useState<Record<string, { nombre: string; tipo: string }[]>>({});

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const mascotasVisibles = (() => {
    if (!currentUser) return [];
    if (currentUser.rol === 'admin') return mascotas;
    if (currentUser.rol === 'veterinario') {
      const vet = veterinarios.find(v => v.id_usuario === currentUser.id);
      if (!vet) return [];
      const mascotasAtendidas = new Set(citas.filter(c => c.id_veterinario === vet.id).map(c => c.id_mascota));
      return mascotas.filter(m => mascotasAtendidas.has(m.id));
    }
    return mascotas.filter(m => m.id_usuario === currentUser.id);
  })();

  const filteredMascotas = mascotasVisibles.filter(m =>
    !search || m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.raza.toLowerCase().includes(search.toLowerCase())
  );

  const mascota = mascotas.find(m => m.id === selectedMascota);
  const dueno = usuarios.find(u => u.id === mascota?.id_usuario);

  const mascotaCitas = citas.filter(c => c.id_mascota === selectedMascota);
  const mascotaConsultas = consultas.filter(c => mascotaCitas.some(mc => mc.id === c.id_cita));

  const getVetName = (citaId: string) => {
    const cita = citas.find(c => c.id === citaId);
    const vet = veterinarios.find(v => v.id === cita?.id_veterinario);
    const user = usuarios.find(u => u.id === vet?.id_usuario);
    return user?.nombre || 'N/A';
  };

  const handleFileUpload = (consultaId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(f => ({ nombre: f.name, tipo: f.type || 'application/octet-stream' }));
    setSimulatedFiles(prev => ({
      ...prev,
      [consultaId]: [...(prev[consultaId] || []), ...newFiles]
    }));
    e.target.value = '';
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Historial Clínico</h1>
        <p className="text-slate-500 mt-1">Consulta el historial médico de cada mascota</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mascota selector */}
        <div className="card space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar mascota..."
              className="input pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filteredMascotas.map(m => {
              const owner = usuarios.find(u => u.id === m.id_usuario);
              const numConsultas = consultas.filter(c => citas.some(ci => ci.id_mascota === m.id && ci.id === c.id_cita)).length;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMascota(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedMascota === m.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedMascota === m.id ? 'bg-blue-500' : 'bg-blue-100'}`}>
                    <PawPrint size={18} className={selectedMascota === m.id ? 'text-white' : 'text-blue-600'} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{m.nombre}</p>
                    <p className={`text-xs truncate ${selectedMascota === m.id ? 'text-blue-100' : 'text-slate-400'}`}>{m.raza}</p>
                    <p className={`text-xs ${selectedMascota === m.id ? 'text-blue-200' : 'text-slate-400'}`}>{owner?.nombre}</p>
                  </div>
                  <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${selectedMascota === m.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {numConsultas}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedMascota ? (
            <div className="card text-center py-16 text-slate-400">
              <PawPrint size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">Selecciona una mascota</p>
              <p className="text-sm mt-1">para ver su historial clínico</p>
            </div>
          ) : (
            <>
              {/* Mascota info */}
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <PawPrint size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">{mascota?.nombre}</h2>
                    <p className="text-slate-500 text-sm">{mascota?.raza}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                      <span>📅 {mascota?.fechaNacimiento ? new Date(mascota.fechaNacimiento).toLocaleDateString('es-CO') : '—'}</span>
                      <span>⚖️ {mascota?.pesoActual} kg</span>
                      <span>👤 {dueno?.nombre}</span>
                      <span>📞 {dueno?.telefono}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-confirmed">{mascotaCitas.length} citas</span>
                  </div>
                </div>
              </div>

              {/* Consultas */}
              {mascotaConsultas.length === 0 ? (
                <div className="card text-center py-12 text-slate-400">
                  <FileText size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Sin consultas registradas</p>
                  <p className="text-sm mt-1">Las consultas aparecerán aquí cuando se finalicen las citas</p>
                </div>
              ) : (
                mascotaConsultas.map(consulta => {
                  const allFiles = [...consulta.archivos, ...(simulatedFiles[consulta.id] || [])];
                  const isOpen = expandedConsulta === consulta.id;
                  return (
                    <div key={consulta.id} className="card overflow-hidden">
                      <button
                        onClick={() => setExpandedConsulta(isOpen ? null : consulta.id)}
                        className="w-full flex items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Stethoscope size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              Consulta – {new Date(consulta.fecha).toLocaleDateString('es-CO')}
                            </p>
                            <p className="text-xs text-slate-400">Dr. {getVetName(consulta.id_cita)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {allFiles.length > 0 && (
                            <span className="badge badge-confirmed text-xs">{allFiles.length} archivo(s)</span>
                          )}
                          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Stethoscope size={16} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-800">Diagnóstico</span>
                              </div>
                              <p className="text-sm text-slate-700">{consulta.diagnostico}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Pill size={16} className="text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-800">Tratamiento</span>
                              </div>
                              <p className="text-sm text-slate-700">{consulta.tratamiento}</p>
                            </div>
                          </div>

                          {consulta.receta && (
                            <div className="bg-amber-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText size={16} className="text-amber-600" />
                                <span className="text-sm font-semibold text-amber-800">Receta médica</span>
                              </div>
                              <p className="text-sm text-slate-700 font-mono bg-white rounded-lg p-2 border border-amber-100">{consulta.receta}</p>
                            </div>
                          )}

                          {/* Archivos */}
                          <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Paperclip size={16} className="text-slate-600" />
                                <span className="text-sm font-semibold text-slate-700">Archivos adjuntos</span>
                              </div>
                              <label className="cursor-pointer text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 font-semibold">
                                <Upload size={12} /> Subir archivo
                                <input type="file" multiple className="hidden" onChange={e => handleFileUpload(consulta.id, e)} />
                              </label>
                            </div>
                            {allFiles.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-2">Sin archivos adjuntos</p>
                            ) : (
                              <div className="space-y-2">
                                {allFiles.map((f, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100">
                                    <span>{getFileIcon(f.tipo)}</span>
                                    <span className="text-sm text-slate-700 truncate flex-1">{f.nombre}</span>
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{f.tipo.split('/')[1]?.toUpperCase()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Citas sin consulta */}
              {mascotaCitas.filter(c => c.estado !== 'cancelada' && !consultas.some(con => con.id_cita === c.id)).map(cita => (
                <div key={cita.id} className="card border-l-4 border-l-amber-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <FileText size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{cita.servicio}</p>
                      <p className="text-xs text-slate-400">{new Date(cita.fechaHora).toLocaleDateString('es-CO')} – <span className="capitalize">{cita.estado}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
