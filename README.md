# CaninoCare 🐾

Sistema de gestión veterinaria desarrollado en Next.js. Incluye control de citas, historial clínico, administración de servicios y gestión de usuarios con control de acceso basado en roles.

## 🚀 Primeros pasos

### Requisitos

- **Node.js** 22 LTS (22.12 o superior)
- **npm** 10+

### Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts disponibles

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build de producción
npm run start   # Servir el build de producción
npm run lint    # Linter
```

## 🔐 Credenciales de prueba

Todos los usuarios usan la contraseña `Canino2026*`.

| Rol | Email | Qué puede ver |
|---|---|---|
| **Admin** | `admin@caninocare.com` | Todo el sistema (citas, historial, usuarios, administración) |
| **Veterinario** | `sofia.vet@caninocare.com` | Solo sus citas asignadas y el historial de las mascotas que atiende |
| **Dueño** | `carlos@email.com` | Solo sus propias citas e historial de sus mascotas |

Otras cuentas disponibles: `vet@caninocare.com`, `dueno@caninocare.com`, `andres.vet@caninocare.com`, `ricardo.vet@caninocare.com`, `maria@email.com`, `juan@email.com`, `ana@email.com`, `pedro@email.com`, etc.

## 🔒 Control de acceso por rol

| Página | Admin | Veterinario | Dueño |
|---|---|---|---|
| `/` Dashboard | ✅ | ✅ (sus datos) | ✅ (sus datos) |
| `/citas` | ✅ todas | ✅ sus asignadas | ✅ sus propias |
| `/historial` | ✅ todas | ✅ mascotas que atiende | ✅ sus mascotas |
| `/usuarios` | ✅ | ❌ | ❌ |
| `/admin` | ✅ | ❌ | ❌ |
| Agendar cita | ✅ | ❌ | ✅ |

Las rutas protegidas redirigen a `/` si el rol no tiene permiso, incluso si se accede por URL directa.

## 🏗️ Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15 (App Router) | Framework principal |
| React | 18 | Librería UI |
| TypeScript | 5 | Tipado estático |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| React Context API | — | Estado global |
| localStorage | — | Persistencia de sesión |
| lucide-react | 0.460 | Iconografía |

## 📋 Datos mock incluidos

- **12 dueños** de mascotas
- **5 mascotas** (Max, Luna, Rocky, Bella, Thor)
- **4 veterinarios** (Medicina General, Dermatología, Cirugía)
- **5 servicios** (Consulta, Vacunación, Peluquería, Cirugía, Radiografía)
- **8 citas** en diferentes estados (pendiente, confirmada, finalizada, cancelada)
- **2 consultas** médicas con archivos adjuntos

Los datos viven en memoria y se resetean al recargar, excepto la sesión del usuario (persiste en `localStorage`).

## 📁 Estructura del proyecto

```
canino-care-grupo5/
├── app/
│   ├── admin/          # Gestión de servicios y reportes (solo admin)
│   ├── citas/          # Agendamiento y listado de citas
│   ├── historial/      # Historial clínico por mascota
│   ├── login/          # Autenticación
│   ├── usuarios/       # Gestión de usuarios (solo admin)
│   └── page.tsx        # Dashboard
├── components/
│   └── ClientLayout.tsx # Layout con sidebar + header
├── context/
│   └── AppContext.tsx  # Estado global y lógica de login
└── data/
    └── mockData.ts     # Datos y tipos
```

## 🚢 Despliegue

El proyecto está preparado para desplegar en [Vercel](https://vercel.com). Basta con conectar el repositorio, no requiere variables de entorno.

## 👥 Equipo

- **Daniela Alexandra Chamorro Guerrero** — Project Manager
- **Hector Jesid Florez Macias** — Arquitecto / Backend
- **Yessica Andrea Figueroa Erazo** — Analista / Frontend
- **Ingrid Johanna Flechas Becerra** — QA / Documentación

**Tutora:** Ing. MSc. Marcela Cascante
**Institución:** Politécnico Grancolombiano
