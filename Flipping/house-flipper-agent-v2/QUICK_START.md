# 🚀 Quick Start - House Flipper Platform v2

## Inicio Rápido en 3 Pasos

### 1️⃣ Instalar (si aún no lo hiciste)
```bash
cd house-flipper-agent-v2
npm install
```

### 2️⃣ Iniciar servidor
```bash
npm run dev
```

### 3️⃣ Abrir navegador
```
http://localhost:3001
```

---

## 📱 Flujo de Usuario

1. **Registro** (primera vez)
   - Ir a http://localhost:3001
   - Click en tab "Registrarse"
   - Llenar: Nombre, Email, Contraseña
   - Click "Crear cuenta"

2. **Login**
   - Tab "Iniciar sesión"
   - Email y contraseña
   - Click "Iniciar sesión"

3. **Usar la plataforma**
   - Redirige automáticamente a "Alimentar Base de Datos"
   - Navegar usando los tabs del header:
     - 🧮 Calculadora
     - 💰 Precios de Referencia
     - 🗄️ Alimentar BBDD

---

## 🎯 Características Principales

### Autenticación
- ✅ Login/Registro con tabs (diseño Figma)
- ✅ Validación de formularios
- ✅ Sesión persistente con NextAuth v5
- ✅ Logout funcional

### Navegación
- ✅ Header fijo con logo y gradiente
- ✅ Tabs horizontales (Calculadora, Precios, Alimentar BBDD)
- ✅ Usuario visible en header
- ✅ Indicador visual de página activa

### Página "Alimentar Base de Datos"
- ✅ Selector de Ciudad (Madrid)
- ✅ Selector de Barrio (24 opciones principales)
- ✅ Estadísticas en tiempo real (275 propiedades)
- ✅ Botón "Usar Existente" → navega a Consulta de Precios
- ✅ Botón "Añadir Más" → ejecuta scraper API

### Página "Consulta de Precios"
- ✅ 24 barrios de Madrid con datos reales
- ✅ Precios reformado/sin reformar por m²
- ✅ 10 factores premium positivos (garaje, terraza, etc.)
- ✅ 10 factores premium negativos (interior, bajo, etc.)
- ✅ Cálculo en tiempo real de ajustes
- ✅ Botón "Usar en Calculadora" → envía datos

### Página "Calculadora de House Flipping"
- ✅ Todas las funcionalidades de v1 migradas
- ✅ InputPanel (precio compra, venta, superficie, duración)
- ✅ CostBreakdown (compra, reforma, venta, mantenimiento)
- ✅ ResultsSummary (inversión, beneficio, ROI, TIR, viabilidad)
- ✅ AdvancedParameters (personalización costos y opciones)
- ✅ PriceEstimator integrado
- ✅ Guardar/cargar análisis (API integration)
- ✅ Recibe precios desde Consulta de Precios
- ✅ Export PDF/Excel (botones preparados)

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Puerto 3001

# Producción
npm run build            # Build
npm start                # Puerto 3001

# Base de datos
npx prisma studio        # Ver BD en GUI
npx prisma generate      # Regenerar cliente
npx prisma db push       # Sincronizar esquema

# Linting
npm run lint             # Verificar código
```

---

## 🌐 URLs Importantes

| URL | Descripción |
|-----|-------------|
| http://localhost:3001 | Home (redirect a login) |
| http://localhost:3001/auth/login | Login/Registro |
| http://localhost:3001/dashboard | Dashboard principal |
| http://localhost:3001/dashboard/pricing/feed | Alimentar BBDD |
| http://localhost:3001/dashboard/calculator | Calculadora |
| http://localhost:3001/dashboard/pricing/consult | Consultar precios |

---

## 📦 Versiones Corriendo

| Versión | Puerto | URL |
|---------|--------|-----|
| v1 | 3000 | http://localhost:3000 |
| v2 | 3001 | http://localhost:3001 |

**Importante**: Ambas versiones pueden correr simultáneamente.

---

## 🆘 Solución de Problemas

### El servidor no inicia
```bash
# Verificar que el puerto 3001 esté libre
lsof -i :3001

# Si está ocupado, matar el proceso
kill -9 <PID>

# Reintentar
npm run dev
```

### Error de dependencias
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de Prisma
```bash
# Regenerar cliente
npx prisma generate

# Si persiste, verificar .env
cat .env | grep DATABASE_URL
```

### Error de compilación
```bash
# Limpiar cache de Next.js
rm -rf .next
npm run dev
```

---

## 🎨 Personalización

### Cambiar colores
Editar `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: '#155DFC', // Tu color aquí
  }
}
```

### Cambiar puerto
Editar `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3002"  // Nuevo puerto
}
```

---

## 📚 Documentación Completa

- `README.md` - Documentación general
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico detallado
- Código fuente comentado

---

## ✅ Checklist de Verificación

Después de iniciar, verifica que:

- [x] Servidor corriendo en puerto 3001
- [x] Página de login carga (http://localhost:3001/auth/login)
- [x] Tabs de Login/Registro funcionan
- [x] Puedes crear una cuenta
- [x] Puedes iniciar sesión
- [x] Dashboard carga y redirige a Feed
- [x] Header muestra tu nombre y botón logout
- [x] Navegación entre tabs funciona (Calculadora, Precios, Feed)
- [x] Página "Alimentar BBDD" con 24 barrios
- [x] Botón "Usar Existente" navega a Consulta
- [x] Página "Consulta de Precios" con factores premium
- [x] Botón "Usar en Calculadora" envía datos
- [x] Calculadora recibe y pre-llena datos
- [x] Puedes guardar/cargar análisis en Calculadora
- [x] Botón logout funciona y redirige a login

---

## 🎯 Próximos Pasos

1. Explorar la interfaz
2. Probar registro y login
3. Navegar entre secciones
4. Revisar código de páginas implementadas
5. Comenzar a desarrollar funcionalidades pendientes

---

**¿Todo listo?** ¡A desarrollar! 🚀
