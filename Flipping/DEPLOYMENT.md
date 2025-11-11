# 🚀 Guía de Deployment - House Flipper Agent

Esta guía te llevará paso a paso desde el código hasta tener la aplicación funcionando en producción con Vercel.

## 📋 Checklist Pre-Deployment

Antes de desplegar, asegúrate de tener:

- [ ] Cuenta de GitHub activa
- [ ] Cuenta de Vercel (puedes usar login con GitHub)
- [ ] Token de Mapbox API
- [ ] Base de datos PostgreSQL configurada (Vercel Postgres o similar)

## 🗄️ Paso 1: Configurar Base de Datos (Vercel Postgres)

### 1.1 Crear Base de Datos en Vercel

1. Ve a tu [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en la pestaña "Storage"
3. Click en "Create Database"
4. Selecciona "Postgres"
5. Dale un nombre (ej: `house-flipper-db`)
6. Selecciona la región más cercana
7. Click en "Create"

### 1.2 Obtener Credenciales

Una vez creada la base de datos:

1. Click en la base de datos
2. Ve a la pestaña ".env.local"
3. Copia las tres variables de entorno:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

## 🔑 Paso 2: Preparar Variables de Entorno

Crea un archivo temporal con todas tus variables de entorno (NO lo subas a Git):

```env
# Database
DATABASE_URL="tu-postgres-prisma-url"
POSTGRES_PRISMA_URL="tu-postgres-prisma-url"
POSTGRES_URL_NON_POOLING="tu-postgres-url-non-pooling"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://tu-app.vercel.app"  # Lo actualizarás después del deploy

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.tu-token-de-mapbox"

# Cron Secret
CRON_SECRET="$(openssl rand -base64 32)"

# Scraping
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
```

### Generar Secrets

Para generar los secrets aleatorios, ejecuta en terminal:

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para CRON_SECRET
openssl rand -base64 32
```

## 📦 Paso 3: Preparar el Repositorio

### 3.1 Inicializar Git (si no lo has hecho)

```bash
cd house-flipper-agent

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: House Flipper Agent MVP"

# Renombrar branch a main
git branch -M main
```

### 3.2 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio
   - Nombre: `house-flipper-agent`
   - Visibilidad: Private (recomendado) o Public
   - NO inicialices con README (ya tienes uno)
3. Copia la URL del repositorio

### 3.3 Push a GitHub

```bash
# Conectar con tu repositorio
git remote add origin https://github.com/tu-usuario/house-flipper-agent.git

# Push del código
git push -u origin main
```

## ☁️ Paso 4: Deploy en Vercel

### 4.1 Crear Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New..." → "Project"
3. Selecciona tu repositorio de GitHub `house-flipper-agent`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 4.2 Configurar Variables de Entorno

Antes de desplegar, configura las variables de entorno:

1. En la sección "Environment Variables":
2. Agrega cada variable:
   - `DATABASE_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (por ahora usa `https://tu-proyecto.vercel.app`)
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `CRON_SECRET`
   - `USER_AGENT`

**IMPORTANTE:**
- Asegúrate de marcar las variables como disponibles en "Production", "Preview" y "Development" si es necesario
- Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente

### 4.3 Deploy

1. Click en "Deploy"
2. Vercel iniciará el proceso de build
3. Espera 2-5 minutos
4. Una vez completado, obtendrás una URL como `https://tu-proyecto.vercel.app`

### 4.4 Actualizar NEXTAUTH_URL

1. Copia la URL de tu deployment
2. Ve a Project Settings → Environment Variables
3. Edita `NEXTAUTH_URL` con tu URL real
4. Redeploy (o haz un push a GitHub para trigger automático)

## 🗃️ Paso 5: Inicializar Base de Datos

Necesitas ejecutar las migraciones de Prisma en producción:

### Opción A: Desde tu máquina local

```bash
# Setea temporalmente la DATABASE_URL de producción
export DATABASE_URL="tu-postgres-prisma-url-de-produccion"

# Ejecuta la migración
npx prisma migrate deploy

# O push del schema directamente
npx prisma db push
```

### Opción B: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Conectar con tu proyecto
vercel link

# Ejecutar comando en Vercel
vercel exec -- npx prisma migrate deploy
```

## ✅ Paso 6: Verificación Post-Deployment

### 6.1 Verificar que el sitio funciona

1. Visita `https://tu-proyecto.vercel.app`
2. Deberías ver la página de login
3. Intenta registrarte y crear una cuenta

### 6.2 Verificar el Cron Job

1. Ve a Vercel Dashboard → Tu Proyecto
2. Click en "Cron Jobs" en el sidebar
3. Deberías ver:
   - Path: `/api/scraper/daily`
   - Schedule: `0 8 * * *` (diario a las 8am UTC)

### 6.3 Test Manual del Scraper

1. Login en la aplicación
2. Ve al dashboard
3. Click en "Scraper Manual"
4. Espera a que complete (puede tardar varios minutos)
5. Verifica que las propiedades aparecen en el mapa y grid

## 🔧 Paso 7: Configuración Adicional (Opcional)

### 7.1 Custom Domain

Si tienes un dominio propio:

1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Configura los DNS records según las instrucciones
4. Actualiza `NEXTAUTH_URL` con tu dominio custom

### 7.2 Conectar Base de Datos a Vercel Project

1. Ve a tu proyecto en Vercel
2. Click en "Storage"
3. Click en "Connect Store"
4. Selecciona tu base de datos Postgres
5. Esto automáticamente inyectará las variables de entorno

### 7.3 Analytics

1. Ve a Project Settings → Analytics
2. Habilita "Vercel Analytics"
3. Esto te dará métricas de uso automáticamente

## 🔄 Paso 8: CI/CD Automático

¡Felicidades! Ahora cada vez que hagas push a GitHub:

1. Vercel automáticamente detectará los cambios
2. Ejecutará el build
3. Desplegará la nueva versión
4. Te notificará del resultado

### Preview Deployments

- Cada pull request genera un deployment de preview
- URL única para testing
- No afecta producción

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

- Verifica que las variables `DATABASE_URL` estén correctas
- Asegúrate de usar `POSTGRES_PRISMA_URL` en producción
- Verifica que la base de datos acepte conexiones desde Vercel

### Error: "NextAuth configuration error"

- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate que `NEXTAUTH_URL` sea la URL correcta (https://)
- No debe terminar en "/"

### Error: "Mapbox token invalid"

- Verifica que `NEXT_PUBLIC_MAPBOX_TOKEN` esté configurado
- Confirma que el token sea válido en Mapbox
- Recuerda que debe empezar con `pk.`

### Cron Job no ejecuta

- Verifica que `vercel.json` esté en la raíz del proyecto
- Confirma que `CRON_SECRET` esté configurado
- Los cron jobs de Vercel solo funcionan en el plan Pro (hobby tier tiene limitaciones)

### Build fails con errores de TypeScript

```bash
# Verifica el build localmente
npm run build

# Si hay errores, corrígelos y haz commit
git add .
git commit -m "fix: build errors"
git push
```

## 📊 Monitoring

### Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Logs" en el sidebar
3. Filtra por:
   - Functions (para ver logs de API)
   - Build (para ver logs de build)
   - Cron (para ver ejecuciones del cron job)

### Prisma Studio en Producción

```bash
# Conectarse a la DB de producción
export DATABASE_URL="tu-url-de-produccion"
npx prisma studio
```

## 🎉 ¡Listo!

Tu aplicación está ahora en producción con:

- ✅ Deploy automático desde GitHub
- ✅ Base de datos PostgreSQL
- ✅ Autenticación funcionando
- ✅ Scraping automático diario
- ✅ HTTPS habilitado
- ✅ CDN global de Vercel

## 🚀 Próximos Pasos

1. **Crear primer usuario:** Regístrate en tu app
2. **Ejecutar scraper:** Obtén tus primeras propiedades
3. **Compartir con tu equipo:** Dales acceso a la URL
4. **Monitorear:** Revisa los logs para ver el cron job ejecutándose

---

**¿Necesitas ayuda?** Revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
