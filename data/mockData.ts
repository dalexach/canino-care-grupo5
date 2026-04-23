export type UserRole = 'admin' | 'dueno' | 'veterinario';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: UserRole;
  fechaRegistro: string;
  activo: boolean;
}

export interface Veterinario {
  id: string;
  id_usuario: string;
  especialidad: string;
  licencia: string;
  horarios: string;
}

export interface Mascota {
  id: string;
  id_usuario: string;
  nombre: string;
  raza: string;
  fechaNacimiento: string;
  pesoActual: number;
  foto?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionMin: number;
  categoria: string;
  activo: boolean;
}

export interface Cita {
  id: string;
  id_mascota: string;
  id_veterinario: string;
  id_usuario: string;
  fechaHora: string;
  servicio: string;
  id_servicio: string;
  estado: 'pendiente' | 'confirmada' | 'finalizada' | 'cancelada';
  observaciones: string;
  monto: number;
}

export interface Consulta {
  id: string;
  id_cita: string;
  diagnostico: string;
  tratamiento: string;
  receta: string;
  fecha: string;
  archivos: { nombre: string; tipo: string }[];
}

export const usuarios: Usuario[] = [
  { id: 'u1', nombre: 'Carlos Ramírez', email: 'carlos@email.com', telefono: '3001234567', rol: 'dueno', fechaRegistro: '2025-01-15', activo: true },
  { id: 'u2', nombre: 'María López', email: 'maria@email.com', telefono: '3009876543', rol: 'dueno', fechaRegistro: '2025-02-10', activo: true },
  { id: 'u3', nombre: 'Juan Torres', email: 'juan@email.com', telefono: '3151234567', rol: 'dueno', fechaRegistro: '2025-02-20', activo: true },
  { id: 'u4', nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '3169876543', rol: 'dueno', fechaRegistro: '2025-03-05', activo: true },
  { id: 'u5', nombre: 'Pedro Gómez', email: 'pedro@email.com', telefono: '3201234567', rol: 'dueno', fechaRegistro: '2025-03-15', activo: true },
  { id: 'u6', nombre: 'Laura Díaz', email: 'laura@email.com', telefono: '3209876543', rol: 'dueno', fechaRegistro: '2025-04-01', activo: true },
  { id: 'u7', nombre: 'Felipe Herrera', email: 'felipe@email.com', telefono: '3211234567', rol: 'dueno', fechaRegistro: '2025-04-10', activo: true },
  { id: 'u8', nombre: 'Valentina Cruz', email: 'valentina@email.com', telefono: '3219876543', rol: 'dueno', fechaRegistro: '2025-05-01', activo: true },
  { id: 'u9', nombre: 'Sebastián Morales', email: 'sebastian@email.com', telefono: '3001111111', rol: 'dueno', fechaRegistro: '2025-05-15', activo: true },
  { id: 'u10', nombre: 'Camila Soto', email: 'camila@email.com', telefono: '3002222222', rol: 'dueno', fechaRegistro: '2025-06-01', activo: true },
  { id: 'v1', nombre: 'Dr. Andrés Peña', email: 'andres.vet@caninocare.com', telefono: '3100000001', rol: 'veterinario', fechaRegistro: '2024-12-01', activo: true },
  { id: 'v2', nombre: 'Dra. Sofía Vargas', email: 'sofia.vet@caninocare.com', telefono: '3100000002', rol: 'veterinario', fechaRegistro: '2024-12-01', activo: true },
  { id: 'v3', nombre: 'Dr. Ricardo Blanco', email: 'ricardo.vet@caninocare.com', telefono: '3100000003', rol: 'veterinario', fechaRegistro: '2025-01-01', activo: true },
  { id: 'admin1', nombre: 'Administrador CaninoCare', email: 'admin@caninocare.com', telefono: '3000000000', rol: 'admin', fechaRegistro: '2024-11-01', activo: true },
  { id: 'u-demo-dueno', nombre: 'Dueño Demo', email: 'dueno@caninocare.com', telefono: '3000000100', rol: 'dueno', fechaRegistro: '2025-01-01', activo: true },
  { id: 'v-demo', nombre: 'Veterinario Demo', email: 'vet@caninocare.com', telefono: '3000000200', rol: 'veterinario', fechaRegistro: '2025-01-01', activo: true },
];

export const veterinarios: Veterinario[] = [
  { id: 'vet1', id_usuario: 'v1', especialidad: 'Medicina General', licencia: 'MV-12345', horarios: 'Lun-Vie 8am-5pm' },
  { id: 'vet2', id_usuario: 'v2', especialidad: 'Dermatología Veterinaria', licencia: 'MV-67890', horarios: 'Lun-Sab 9am-6pm' },
  { id: 'vet3', id_usuario: 'v3', especialidad: 'Cirugía Veterinaria', licencia: 'MV-11111', horarios: 'Mar-Vie 10am-7pm' },
  { id: 'vet-demo', id_usuario: 'v-demo', especialidad: 'Medicina General', licencia: 'MV-DEMO', horarios: 'Lun-Vie 8am-5pm' },
];

export const mascotas: Mascota[] = [
  { id: 'm1', id_usuario: 'u1', nombre: 'Max', raza: 'Labrador Retriever', fechaNacimiento: '2022-03-15', pesoActual: 28.5 },
  { id: 'm2', id_usuario: 'u2', nombre: 'Luna', raza: 'Golden Retriever', fechaNacimiento: '2021-07-20', pesoActual: 25.0 },
  { id: 'm3', id_usuario: 'u3', nombre: 'Rocky', raza: 'Bulldog Francés', fechaNacimiento: '2023-01-10', pesoActual: 12.3 },
  { id: 'm4', id_usuario: 'u4', nombre: 'Bella', raza: 'Poodle Miniatura', fechaNacimiento: '2020-11-05', pesoActual: 5.8 },
  { id: 'm5', id_usuario: 'u5', nombre: 'Thor', raza: 'Rottweiler', fechaNacimiento: '2022-09-30', pesoActual: 42.0 },
];

export const servicios: Servicio[] = [
  { id: 's1', nombre: 'Consulta General', descripcion: 'Revisión médica completa del paciente', precioBase: 65000, duracionMin: 30, categoria: 'Medicina', activo: true },
  { id: 's2', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas según esquema', precioBase: 45000, duracionMin: 20, categoria: 'Preventivo', activo: true },
  { id: 's3', nombre: 'Baño y Peluquería', descripcion: 'Baño, secado y corte de pelo', precioBase: 55000, duracionMin: 90, categoria: 'Estética', activo: true },
  { id: 's4', nombre: 'Cirugía Menor', descripcion: 'Procedimientos quirúrgicos menores', precioBase: 350000, duracionMin: 120, categoria: 'Cirugía', activo: true },
  { id: 's5', nombre: 'Radiografía', descripcion: 'Estudio radiológico digital', precioBase: 85000, duracionMin: 45, categoria: 'Diagnóstico', activo: true },
];

export const citas: Cita[] = [
  { id: 'c1', id_mascota: 'm1', id_veterinario: 'vet1', id_usuario: 'u1', fechaHora: '2026-04-22T09:00', servicio: 'Consulta General', id_servicio: 's1', estado: 'confirmada', observaciones: 'Chequeo rutinario anual', monto: 65000 },
  { id: 'c2', id_mascota: 'm2', id_veterinario: 'vet2', id_usuario: 'u2', fechaHora: '2026-04-22T10:30', servicio: 'Vacunación', id_servicio: 's2', estado: 'pendiente', observaciones: 'Vacuna antirrábica', monto: 45000 },
  { id: 'c3', id_mascota: 'm3', id_veterinario: 'vet1', id_usuario: 'u3', fechaHora: '2026-04-22T11:00', servicio: 'Consulta General', id_servicio: 's1', estado: 'confirmada', observaciones: 'Revisión por tos', monto: 65000 },
  { id: 'c4', id_mascota: 'm4', id_veterinario: 'vet3', id_usuario: 'u4', fechaHora: '2026-04-23T14:00', servicio: 'Cirugía Menor', id_servicio: 's4', estado: 'confirmada', observaciones: 'Esterilización programada', monto: 350000 },
  { id: 'c5', id_mascota: 'm5', id_veterinario: 'vet2', id_usuario: 'u5', fechaHora: '2026-04-24T09:30', servicio: 'Radiografía', id_servicio: 's5', estado: 'pendiente', observaciones: 'Revisión cadera', monto: 85000 },
  { id: 'c6', id_mascota: 'm1', id_veterinario: 'vet1', id_usuario: 'u1', fechaHora: '2026-04-15T08:00', servicio: 'Vacunación', id_servicio: 's2', estado: 'finalizada', observaciones: 'Vacuna polivalente', monto: 45000 },
  { id: 'c7', id_mascota: 'm2', id_veterinario: 'vet2', id_usuario: 'u2', fechaHora: '2026-04-10T11:00', servicio: 'Baño y Peluquería', id_servicio: 's3', estado: 'finalizada', observaciones: 'Corte estilo cachorro', monto: 55000 },
  { id: 'c8', id_mascota: 'm3', id_veterinario: 'vet3', id_usuario: 'u3', fechaHora: '2026-04-05T15:00', servicio: 'Radiografía', id_servicio: 's5', estado: 'cancelada', observaciones: 'Cancelada por el dueño', monto: 85000 },
];

export const consultas: Consulta[] = [
  {
    id: 'con1', id_cita: 'c6',
    diagnostico: 'Paciente en buen estado de salud general. Sin hallazgos patológicos.',
    tratamiento: 'Aplicación de vacuna polivalente DA2PP. Desparasitación interna.',
    receta: 'Milbemax 12.5mg - 1 tableta mensual por 3 meses',
    fecha: '2026-04-15',
    archivos: [{ nombre: 'carnet_vacunacion.pdf', tipo: 'application/pdf' }]
  },
  {
    id: 'con2', id_cita: 'c7',
    diagnostico: 'Piel y pelo en buen estado. Se realizó tratamiento antiparasitario externo.',
    tratamiento: 'Baño medicado con shampoo antipulgas. Corte higiénico.',
    receta: 'Frontline Spray - aplicar cada 3 meses',
    fecha: '2026-04-10',
    archivos: []
  },
];
