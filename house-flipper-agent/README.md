# House Flipper Agent 🏠

Agente inteligente de búsqueda de oportunidades inmobiliarias para house flipping en Madrid.

## 🚀 Características

- **Scraping automático** de Idealista, Fotocasa y Pisos.com
- **Sistema de scoring inteligente** (0-100) basado en múltiples criterios
- **Mapa interactivo** con Mapbox mostrando propiedades georreferenciadas
- **Filtros avanzados** por zona, precio, superficie, score, etc.
- **Autenticación multi-usuario** con NextAuth.js
- **Cron job automático** que ejecuta scraping diariamente a las 8am
- **Dashboard responsive** con vista de grid, mapa y split
- **Seguimiento de historial de precios**
- **Sistema de favoritos**

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com)
- Token de Mapbox API ([obtener aquí](https://www.mapbox.com/))
- Base de datos PostgreSQL (Vercel Postgres recomendado)

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS
- **Backend:** Next.js API Routes, Playwright
- **Base de datos:** Vercel Postgres + Prisma ORM
- **Autenticación:** NextAuth.js v5
- **Mapa:** Mapbox GL JS
- **Scraping:** Playwright con técnicas anti-detección
- **Deployment:** Vercel con CI/CD automático

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/house-flipper-agent.git
cd house-flipper-agent
```

### 2. Instalar dependencias

**IMPORTANTE:** Antes de instalar, debes arreglar los permisos del caché de npm:

```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

Luego instala las dependencias:

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Database (Vercel Postgres)
DATABASE_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-token"

# Cron Secret (para proteger el endpoint)
CRON_SECRET="another-random-secret"

# Scraping (opcional)
USER_AGENT="Mozilla/5.0 ..."
```

### 4. Configurar la base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para ver la BD
npx prisma studio
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Deployment en Vercel

### 1. Push a GitHub

```bash
git init
git add .
git commit -m "Initial commit: House Flipper Agent MVP"
git branch -M main
git remote add origin https://github.com/tu-usuario/house-flipper-agent.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js

### 3. Configurar Variables de Entorno en Vercel

En la configuración del proyecto en Vercel, agrega todas las variables de entorno:

- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (tu URL de producción, ej: `https://tu-app.vercel.app`)
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `CRON_SECRET`

### 4. Deploy

Vercel automáticamente:
- Instalará las dependencias
- Ejecutará el build
- Desplegará la aplicación
- Configurará el Cron Job (definido en `vercel.json`)

## 📊 Uso

### Primer Uso

1. **Registro:** Ve a `/auth/register` y crea una cuenta
2. **Login:** Inicia sesión en `/auth/login`
3. **Ejecutar Scraper:** En el dashboard, click en "Scraper Manual" para la primera ejecución
4. **Explorar propiedades:** Usa los filtros y el mapa para encontrar oportunidades

### Scraping Automático

El sistema ejecuta scraping automáticamente todos los días a las 8am (hora UTC) gracias al Vercel Cron Job.

### Sistema de Scoring

Las propiedades se puntúan de 0 a 100 basándose en:

- **Descuento sobre precio medio (40pts):** Propiedades con >30% descuento obtienen máxima puntuación
- **Superficie (20pts):** Propiedades >150m² obtienen máxima puntuación
- **Planta (15pts):** Plantas ≥3 son ideales
- **Año de construcción (10pts):** Edificios de los 70s son preferidos
- **Zona prioritaria (15pts):** Estar en zona de alta demanda

#### Zonas Prioritarias en Madrid:

- **Guindalera** (Francisco Silvela - Parque de las Avenidas)
- **Delicias y Palos de la Frontera** (cerca de Atocha/Matadero)
- **Pacífico y Reina Cristina** (junto al Retiro)
- **Prosperidad y Ciudad Jardín** (Parque de Berlín)
- **Retiro** (zona Reyes Magos)
- **Argüelles** (Gaztambide, Vallehermoso, Guzmán el Bueno)

### Filtros y Criterios

El sistema automáticamente filtra por:
- ✅ Superficie mínima: 120m²
- ✅ Estado: Para reformar / Reforma integral
- ✅ Exterior: Sí
- ❌ Planta baja: NO
- ❌ Edificios 1890-1920 (estructura de madera): NO
- ❌ Zonas protegidas (Centro, La Latina, etc.): NO

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build
npm run start

# Linting
npm run lint

# Prisma
npx prisma studio              # UI para la base de datos
npx prisma migrate dev         # Crear migración
npx prisma generate            # Generar cliente
npx prisma db push             # Push schema sin migración

# Playwright (para scraping local)
npx playwright install         # Instalar navegadores
```

## 📁 Estructura del Proyecto

```
house-flipper-agent/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── properties/        # CRUD de propiedades
│   │   ├── scraper/           # Endpoints de scraping
│   │   └── favorites/         # Sistema de favoritos
│   ├── auth/                  # Páginas de login/register
│   ├── dashboard/             # Dashboard principal
│   │   └── properties/[id]/   # Detalle de propiedad
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Componentes base (Button, Card, etc.)
│   ├── PropertyCard.tsx       # Card de propiedad
│   └── PropertyMap.tsx        # Mapa interactivo
├── lib/
│   ├── auth/                  # Configuración de NextAuth
│   ├── db/                    # Prisma client
│   ├── scraper/               # Scrapers (Idealista, Fotocasa, Pisos.com)
│   ├── scoring/               # Sistema de puntuación
│   └── utils/                 # Utilidades (zonas, formato, etc.)
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── vercel.json                # Configuración de Cron
└── README.md
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales:

- **User:** Usuarios del sistema
- **Property:** Propiedades scrapeadas
- **PropertyHistory:** Historial de cambios de precio
- **UserFavorite:** Propiedades favoritas
- **SearchCriteria:** Criterios de búsqueda configurables
- **Session/Account/VerificationToken:** NextAuth

## 🔐 Seguridad

- Todas las rutas del dashboard están protegidas con middleware de NextAuth
- Las contraseñas se hashean con bcrypt
- El endpoint de Cron está protegido con `CRON_SECRET`
- Rate limiting en scrapers para evitar bloqueos
- Validación de inputs con Zod

## 🚧 Roadmap (Post-MVP)

- [ ] **Fase 2:** Machine Learning para scoring avanzado y predicción de ROI
- [ ] **Fase 3:** Sistema de notificaciones (Email, Telegram, Push)
- [ ] **Fase 4:** Analytics avanzados y exportación PDF/Excel
- [ ] **Fase 5:** PWA y notificaciones push
- [ ] **Fase 6:** Sistema de alertas inteligentes
- [ ] **Fase 7:** Integración con APIs de tasación

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:
- Abre un issue en GitHub
- Consulta la documentación de [Next.js](https://nextjs.org/docs)
- Revisa la documentación de [Vercel](https://vercel.com/docs)

## ⚠️ Disclaimer

Este proyecto es para uso educativo y personal. El scraping de sitios web puede violar los términos de servicio de los portales inmobiliarios. Usa este código bajo tu propia responsabilidad y considera implementar:
- Delays más largos entre requests
- Proxies rotativos
- Respeto de robots.txt
- Rate limiting agresivo

---

Desarrollado con ❤️ para encontrar las mejores oportunidades de inversión inmobiliaria en Madrid.
