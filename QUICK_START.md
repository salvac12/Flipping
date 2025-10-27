# 🚀 Quick Start - House Flipper Agent

Guía rápida para poner en marcha tu agente de inversión inmobiliaria en menos de 10 minutos.

## ⚡ Paso a Paso Rápido

### 1. Arreglar permisos de npm (IMPORTANTE)

```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### 2. Instalar dependencias

```bash
cd house-flipper-agent
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Database - Obtén de Vercel Postgres
DATABASE_URL="postgres://..."

# NextAuth - Genera con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Mapbox - Obtén de https://mapbox.com
NEXT_PUBLIC_MAPBOX_TOKEN="pk.tu-token-aqui"

# Cron Secret - Genera con: openssl rand -base64 32
CRON_SECRET="otro-secret-aqui"
```

### 4. Setup de base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear/actualizar schema en DB
npx prisma db push

# (Opcional) Ver la base de datos
npx prisma studio
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

## 📝 Primeros Pasos

1. **Registrarse:** Ve a `/auth/register`
2. **Login:** Inicia sesión
3. **Ejecutar Scraper:** Click en "Scraper Manual" en el dashboard
4. **Explorar propiedades:** Usa el mapa y los filtros

## 🚀 Deploy a Producción

Revisa la guía completa en [`DEPLOYMENT.md`](./DEPLOYMENT.md)

### Resumen rápido:

```bash
# 1. Crear repo en GitHub
git remote add origin https://github.com/tu-usuario/house-flipper-agent.git
git push -u origin main

# 2. Deploy en Vercel
# - Ve a vercel.com
# - Import tu repositorio
# - Configura las variables de entorno
# - Deploy!

# 3. Inicializar DB en producción
npx prisma migrate deploy
```

## 🔧 Comandos Útiles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting

npx prisma studio    # Ver base de datos
npx prisma db push   # Actualizar schema
npx prisma generate  # Generar cliente
```

## 🐛 Problemas Comunes

### "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correcta
- Asegúrate de que la base de datos esté corriendo

### "NextAuth error"
- Genera un nuevo `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Verifica que `NEXTAUTH_URL` sea correcta

### "npm install fails"
- Ejecuta: `sudo chown -R $(whoami) ~/.npm`
- Luego: `npm cache clean --force`
- Reinténtalo

### "Mapbox map not showing"
- Verifica que `NEXT_PUBLIC_MAPBOX_TOKEN` esté configurado
- El token debe empezar con `pk.`
- Confirma que el token sea válido en mapbox.com

## 📚 Documentación Completa

- [`README.md`](./README.md) - Documentación completa del proyecto
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Guía detallada de deployment
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)

## 🎯 Próximos Pasos

Una vez que tengas el proyecto corriendo:

1. ✅ Personaliza las zonas de Madrid en `lib/utils/zones.ts`
2. ✅ Ajusta el sistema de scoring en `lib/scoring/property-scorer.ts`
3. ✅ Configura el cron job para scraping automático
4. ✅ Implementa notificaciones por email
5. ✅ Agrega filtros personalizados al dashboard

## 🤝 ¿Necesitas Ayuda?

- 📖 Lee la documentación completa en README.md
- 🐛 Abre un issue en GitHub
- 💬 Revisa el código - está bien documentado!

---

¡Feliz house flipping! 🏠💰
