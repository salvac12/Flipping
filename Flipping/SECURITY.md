# 🔒 Security Policy

## API Keys y Secrets Management

### API Keys Utilizadas

Este proyecto utiliza las siguientes API keys:

| Service | Variable | Tipo | Requerida |
|---------|----------|------|-----------|
| **Mapbox** | `NEXT_PUBLIC_MAPBOX_TOKEN` | Pública | ✅ Sí |
| **ScraperAPI** | `SCRAPERAPI_KEY` | Privada | ⚠️ Opcional |
| **Database** | `DATABASE_URL` | Privada | ✅ Sí |
| **NextAuth** | `NEXTAUTH_SECRET` | Privada | ✅ Sí |
| **Vercel Cron** | `CRON_SECRET` | Privada | ✅ Sí |

### ⚠️ Keys NO Utilizadas

Este proyecto **NO** utiliza:
- ❌ Google Cloud APIs (Google Maps, Gemini, etc.)
- ❌ Claude/Anthropic APIs
- ❌ OpenAI APIs
- ❌ Perplexity APIs

**Nota:** Las Google API keys encontradas en `scripts/idealista-*-analysis.json` son **públicas de Idealista**, no del proyecto.

---

## 🛡️ Sistema de Protección Multinivel

### Nivel 1: `.gitignore` ✅

Todos los archivos sensibles están en `.gitignore`:

```gitignore
# Local env files
.env
.env*.local
.env.development
.env.production
.env.test
*.env
**/.env
**/.env.*

# Security - Sensitive files
*.key
*.pem
*.p12
*.pfx
secrets/
secrets.*
*secret*
*credentials*
```

### Nivel 2: Pre-commit Hook (Gitleaks) ✅

**Instalación automática:**

El hook está configurado en `.git/hooks/pre-commit` y se ejecuta automáticamente antes de cada commit.

**Primera vez en este repositorio:**

```bash
# 1. Instalar gitleaks (solo una vez)
brew install gitleaks  # macOS
# O para Linux: https://github.com/gitleaks/gitleaks#installation

# 2. Hacer el hook ejecutable (si es necesario)
chmod +x .git/hooks/pre-commit

# 3. ¡Listo! Ya está protegido automáticamente
```

**Cómo funciona:**

- ✅ Escanea archivos staged antes de cada commit
- ✅ Bloquea el commit si detecta secrets
- ✅ Usa la configuración `.gitleaks.toml` con allowlist
- ✅ Redacta secrets en la salida (no los muestra completos)

**Bypass del hook (NO recomendado):**

```bash
git commit --no-verify  # Solo en casos excepcionales
```

### Nivel 3: GitHub Secret Scanning ✅

GitHub escanea automáticamente todos los repositorios públicos buscando secrets conocidos.

**Cómo revisar alertas:**

1. Ve a tu repositorio en GitHub
2. **Security** → **Secret scanning**
3. Revisa las alertas activas

**Cerrar falsos positivos:**

Para las Google API keys de Idealista:
```
Estado: Won't fix / False positive
Razón: "Public Idealista API keys found during technical scraping analysis, not private project credentials"
```

---

## 🔑 Cómo Obtener API Keys

### Mapbox Token

1. Regístrate en [Mapbox](https://www.mapbox.com/)
2. Ve a **Account** → **Access tokens**
3. Crea un nuevo token:
   - **Name:** house-flipper-agent
   - **Scopes:** Styles:Read, Fonts:Read, Datasets:Read, Vision:Read
4. Copia el token (empieza con `pk.`)
5. Añádelo a tu `.env`:
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoiam9...
   ```

### ScraperAPI Key (Opcional)

1. Regístrate en [ScraperAPI](https://www.scraperapi.com/)
2. Ve a **Dashboard**
3. Copia tu API key
4. Añádela a tu `.env`:
   ```env
   SCRAPERAPI_KEY=tu_api_key_aqui
   ```

### NextAuth Secret

Genera un secret aleatorio:

```bash
openssl rand -base64 32
```

Añádelo a tu `.env`:

```env
NEXTAUTH_SECRET=el_secret_generado_aqui
```

---

## 📋 Checklist de Seguridad para Nuevos Desarrolladores

- [ ] Clona el repositorio
- [ ] Copia `.env.example` a `.env`
- [ ] Rellena las variables requeridas con tus propias keys
- [ ] **NUNCA** hagas commit de `.env`
- [ ] Instala gitleaks: `brew install gitleaks`
- [ ] Verifica que el hook funciona: `git add . && git commit -m "test"` (debería escanear)
- [ ] Si añades nuevas API keys, actualiza `.gitleaks.toml` allowlist

---

## 🚨 Qué Hacer si Expones un Secret

### 1. **Actúa inmediatamente**

```bash
# Si aún NO has hecho push:
git reset --soft HEAD~1  # Deshaz el commit
# Elimina el secret del archivo
# Vuelve a hacer commit

# Si YA hiciste push:
# 1. Revoca la key inmediatamente en el servicio (Mapbox, etc.)
# 2. Genera una nueva key
# 3. Actualiza tu .env local
# 4. Elimina el archivo del historial de git
```

### 2. **Eliminar del historial de Git** (avanzado)

```bash
# Usa BFG Repo Cleaner o git filter-branch
# Ver: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

### 3. **Actualiza GitHub**

- Cierra la alerta de Secret Scanning en GitHub Security
- Marca como "Revoked" cuando hayas revocado la key

---

## 📞 Reportar Vulnerabilidades de Seguridad

Si encuentras una vulnerabilidad de seguridad en este proyecto:

1. **NO** abras un issue público
2. Contacta al mantenedor directamente
3. Proporciona detalles de la vulnerabilidad
4. Espera respuesta antes de divulgar públicamente

---

## 🔍 Auditoría de Seguridad

### Escaneo manual con gitleaks

Escanear todo el repositorio:

```bash
gitleaks detect --verbose
```

Escanear solo archivos staged:

```bash
gitleaks protect --staged --verbose
```

### Verificar archivos ignorados

```bash
git check-ignore -v .env .env.local
```

### Buscar secrets en historial

```bash
gitleaks detect --log-opts="--all"
```

---

## 📚 Referencias

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Mapbox Token Security](https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/)
