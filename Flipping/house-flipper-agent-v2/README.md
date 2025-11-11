# House Flipper Platform v2

Nueva versión de la plataforma de análisis inmobiliario con diseño renovado basado en Figma.

## 🎨 Características del Nuevo Diseño

- **Sistema de diseño actualizado** basado en las especificaciones de Figma
- **Interfaz moderna y limpia** con mejor UX
- **Navegación mejorada** con tabs horizontales
- **Colores y tipografía renovados** (Inter font, primary blue #155DFC)
- **Componentes UI consistentes** en toda la aplicación

## 🚀 Inicio Rápido

### Instalación

```bash
cd house-flipper-agent-v2
npm install
```

### Configuración

El proyecto comparte la configuración `.env` con la versión 1:
- Base de datos PostgreSQL
- Variables de NextAuth
- Tokens de Mapbox
- Claves de API de scraping

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3001**

### Build

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
house-flipper-agent-v2/
├── app/
│   ├── auth/              # Autenticación con tabs
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard principal
│   │   ├── calculator/    # Calculadora
│   │   ├── pricing/
│   │   │   ├── feed/     # Alimentar BBDD
│   │   │   └── consult/  # Consultar precios
│   │   └── layout.tsx
│   ├── api/              # API routes (compartidas con v1)
│   └── globals.css       # Estilos globales
├── components/
│   ├── ui/               # Componentes base
│   ├── auth/             # Formularios de auth
│   └── layout/           # Header y navegación
├── lib/                  # Lógica compartida con v1
└── prisma/              # Esquema de BD compartido
```

## 🎨 Sistema de Diseño

### Colores

- **Primary**: #155DFC (azul principal)
- **Success**: #00A63E (verde para acciones positivas)
- **Background**: #F9FAFB (fondo general)
- **Card**: #FFFFFF (fondo de cards)
- **Text Primary**: #101828
- **Text Secondary**: #4A5565

### Tipografía

- **Font Family**: Inter
- **Heading 1**: 30px
- **Heading 2**: 20px
- **Body**: 16px
- **Body Small**: 14px
- **Caption**: 12px

### Border Radius

- **Card**: 14px
- **Button**: 8px
- **Input**: 8px

## 🔄 Diferencias con v1

1. **Puerto**: v2 corre en puerto 3001 (v1 en 3000)
2. **Diseño**: UI completamente renovada según Figma
3. **Navegación**: Tabs horizontales en lugar de sidebar
4. **Header**: Diseño simplificado con logo y usuario
5. **Páginas de auth**: Con tabs para login/registro
6. **Base de datos**: Compartida con v1

## 📝 Páginas Implementadas

### ✅ Completadas

- **Login/Registro** - Con tabs y diseño renovado
- **Dashboard Layout** - Con header y navegación
- **Alimentar Base de Datos** - Página principal según Figma
  - Selector de ciudad/barrio
  - Estadísticas de propiedades
  - Botones de acción

### 🚧 En Desarrollo

- **Calculadora** - Placeholder (migrar de v1)
- **Consulta de Precios** - Placeholder (migrar de v1)
- **Propiedades** - Por implementar
- **Comparables** - Por implementar

## 🔗 APIs Compartidas

El proyecto v2 comparte las APIs con v1:

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/register` - Registro de usuarios
- `/api/properties` - Gestión de propiedades
- `/api/scraper/*` - Scrapers
- `/api/favorites` - Favoritos

## 🛠️ Tecnologías

- **Next.js 15** con App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS** con tokens personalizados
- **shadcn/ui** para componentes base
- **NextAuth v5** para autenticación
- **Prisma** + PostgreSQL
- **Mapbox GL JS**

## 📦 Dependencias Principales

- next: ^15.5.6
- react: ^19.2.0
- next-auth: ^5.0.0-beta.29
- @prisma/client: ^6.18.0
- tailwindcss: ^3.4.17
- lucide-react: ^0.548.0

## 🚀 Próximos Pasos

1. Migrar la calculadora de house flipping
2. Implementar consulta de precios de referencia
3. Añadir funcionalidad de scrapers
4. Implementar sistema de favoritos
5. Añadir mapa de propiedades
6. Testing completo
7. Optimización de rendimiento

## 👥 Desarrollo

- **Versión**: 2.0.0
- **Puerto de desarrollo**: 3001
- **Puerto de producción**: 3001

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
