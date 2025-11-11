# 🗄️ Configuración de Base de Datos

Para que la aplicación funcione completamente (registro de usuarios, guardar análisis, etc.), necesitas configurar una base de datos PostgreSQL.

## ⚡ Opción 1: Neon (Recomendado - Gratis)

Neon ofrece PostgreSQL serverless gratuito con excelente performance.

### Pasos:

1. **Ve a Neon**: https://neon.tech
2. **Crea una cuenta** (usa GitHub o email)
3. **Crea un nuevo proyecto**:
   - Nombre: `house-flipper-agent`
   - Región: Selecciona la más cercana
   - PostgreSQL Version: 16 (la última)
4. **Copia la Connection String**:
   - Ve a "Dashboard" → "Connection Details"
   - Copia el "Connection string"
   - Debería verse así: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

5. **Actualiza tu archivo `.env`**:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   POSTGRES_PRISMA_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

6. **Ejecuta las migraciones**:
   ```bash
   cd /Users/salvacarrillo/Desktop/CaludeCodeTest/house-flipper-agent
   npx prisma migrate dev --name init
   ```

7. **Reinicia el servidor**:
   - Presiona `Ctrl+C` en la terminal donde corre `npm run dev`
   - Ejecuta de nuevo: `npm run dev`

---

## 🐘 Opción 2: Supabase (También Gratis)

1. **Ve a Supabase**: https://supabase.com
2. **Crea una cuenta**
3. **Crea un nuevo proyecto**:
   - Nombre: `house-flipper-agent`
   - Database Password: Guarda esta contraseña
   - Región: Selecciona la más cercana
4. **Obtén la Connection String**:
   - Ve a "Project Settings" → "Database"
   - Busca "Connection string" → "URI"
   - Debería verse así: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
5. **Sigue los pasos 5-7 de la Opción 1**

---

## 💻 Opción 3: PostgreSQL Local

Si prefieres instalar PostgreSQL localmente:

### macOS:
```bash
# Instalar con Homebrew
brew install postgresql@16
brew services start postgresql@16

# Crear base de datos
createdb house_flipper_dev

# Tu DATABASE_URL será:
# DATABASE_URL="postgresql://tu-usuario@localhost:5432/house_flipper_dev"
```

### Windows:
1. Descarga PostgreSQL: https://www.postgresql.org/download/windows/
2. Instala siguiendo el wizard
3. Abre pgAdmin 4
4. Crea una nueva base de datos llamada `house_flipper_dev`

---

## ✅ Verificar que funciona

Después de configurar la base de datos, ejecuta:

```bash
npx prisma db push
```

Deberías ver:
```
✔ Generated Prisma Client
✔ Database schema pushed to database
```

Ahora puedes:
- ✅ Registrar usuarios
- ✅ Guardar análisis
- ✅ Ver propiedades scrapeadas
- ✅ Ejecutar el scraper

---

## 🚨 Solución de Problemas

### Error: "Can't reach database server"
- Verifica que copiaste correctamente la connection string
- Asegúrate de que incluye `?sslmode=require` al final para Neon/Supabase

### Error: "Authentication failed"
- Verifica usuario y contraseña en la connection string
- Para Neon/Supabase, regenera la contraseña si es necesario

### Error durante migrate
- Asegúrate de estar en la carpeta correcta
- Verifica que el archivo `.env` existe y tiene DATABASE_URL

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas, corre estos comandos y comparte el output:

```bash
cd /Users/salvacarrillo/Desktop/CaludeCodeTest/house-flipper-agent
npx prisma db pull
```

Esto intentará conectarse a tu base de datos y te dirá si hay algún problema.