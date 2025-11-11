# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Next.js 15 (App Router) real estate platform for finding house flipping opportunities in Madrid. The application has evolved into a comprehensive tool featuring:

1. **House Flipping Calculator** - Primary feature for analyzing potential real estate investments
2. **Property Scraping System** - Automated data collection from Idealista, Fotocasa, and Pisos.com
3. **Reference Pricing Database** - Manual and automated pricing data management
4. **Interactive Map** - Mapbox-powered visualization with zone analysis

**Project Locations:**
- v1: `house-flipper-agent/` (port 3000) - Original version with search agent
- v2: `house-flipper-agent-v2/` (port 3001) - Redesigned with Figma UI, Calculator-first approach

**Active Version:** v2 on port 3001
**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, NextAuth v5, Mapbox GL JS, TailwindCSS

## Common Commands

### Development
```bash
# V2 (Active Development - Redesigned UI)
cd house-flipper-agent-v2
npm run dev              # Start development server (http://localhost:3001)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# V1 (Legacy - Original Version)
cd house-flipper-agent
npm run dev              # Port 3000
```

### Database (Prisma)
```bash
# Both versions share the same database
cd house-flipper-agent-v2  # or house-flipper-agent
npx prisma generate      # Generate Prisma client (run after schema changes)
npx prisma migrate dev   # Create and apply migration
npx prisma db push       # Push schema without migration (dev only)
npx prisma studio        # Open database GUI

# Database setup (first time only)
# Follow instructions in SETUP_DATABASE.md for Neon/Supabase/Local PostgreSQL
```

### Playwright (Scraping)
```bash
cd house-flipper-agent
npx playwright install   # Install browser binaries (required for scraping)
```

### First-Time Setup
```bash
cd house-flipper-agent
# Fix npm permissions if needed
sudo chown -R $(whoami) ~/.npm
npm cache clean --force

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with actual credentials

# Initialize database
npx prisma generate
npx prisma migrate dev --name init
```

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **Database:** PostgreSQL (Vercel Postgres) + Prisma ORM
- **Auth:** NextAuth.js v5 (beta) with credentials provider
- **Scraping:** Playwright with stealth techniques + @sparticuz/chromium for Vercel
- **Maps:** Mapbox GL JS with custom zone visualization
- **Styling:** TailwindCSS + shadcn/ui components
- **Language:** TypeScript
- **Deployment:** Vercel with Cron Jobs

### Recent Major Updates (Nov 2025)

#### Version 2 Redesign (Active)
- **Complete Figma Redesign**: New UI/UX based on professional Figma designs
- **Calculator-First Approach**: House Flipping Calculator as the main dashboard feature
- **URL Import System**: Import property data directly from Idealista/Fotocasa/Pisos.com URLs
- **Saved Analyses Management**: Load, view, and delete previously saved investment analyses
- **Mobile Responsive**: Fully responsive design with adaptive navigation
- **Database Setup Guide**: Comprehensive SETUP_DATABASE.md for Neon/Supabase/Local PostgreSQL

#### Version 1 (Legacy)
- **Property Search Agent**: AI-powered search interface (moved to /dashboard/search-agent in v2)
- **Chromium Integration**: Added @sparticuz/chromium for Vercel serverless compatibility
- **Enhanced Scraping**: Improved anti-detection with playwright-extra and stealth plugins
- **Hydration Fix**: Resolved React 19 hydration errors with suppressHydrationWarning

### Core Business Logic

#### Scraping System (`lib/scraper/`)
Three separate scrapers for each portal using Playwright:
- `idealista-scraper.ts` - Primary scraper with anti-detection
- `fotocasa-scraper.ts` - Secondary source
- `pisoscom-scraper.ts` - Tertiary source
- `index.ts` - Orchestrator that runs all scrapers

Key features:
- Random delays between requests (2-5 seconds)
- Stealth browser configurations
- Automatic coordinate extraction from maps
- Cheerio for HTML parsing

#### Scoring Algorithm (`lib/scoring/property-scorer.ts`)
Properties scored 0-100 based on:
1. **Price discount vs zone average (40pts)** - Properties >30% below market get max points
2. **Surface area (20pts)** - Properties >150m² get max points
3. **Floor level (15pts)** - 3rd floor+ is ideal, ground floor disqualifies
4. **Build year (10pts)** - 1970s buildings preferred, 1890-1920 excluded (wood structure)
5. **Priority zone (15pts)** - Must be in one of 6 Madrid zones

Penalties applied for:
- Interior properties (30% reduction)
- No reform needed (15% reduction)
- Surface <120m² (50% reduction)

#### Zone Management (`lib/utils/zones.ts`)
Defines 6 priority zones in Madrid with geographic coordinates and radius:
- Guindalera, Delicias, Pacífico, Prosperidad, Retiro, Argüelles
- Uses Haversine formula for distance calculation
- Each zone has configurable radius (800-1200m)

### Database Schema (`prisma/schema.prisma`)

Key tables:
- **User** - Multi-tenant authentication with relation to FlippingAnalysis
- **FlippingAnalysis** - Saved house flipping calculations (NEW in v2)
  - purchasePrice, salePrice, surface, duration, location
  - calculations (JSON): All computed values (costs, ROI, TIR, etc)
  - parameters (JSON): User-configured parameters (ITP%, renovation costs, etc)
  - totalInvestment, netProfit, roi, viable (denormalized for quick queries)
- **Property** - Scraped properties with scoring data
- **PropertyHistory** - Price change tracking
- **UserFavorite** - Bookmarked properties with notes/ratings
- **SearchCriteria** - Saved search filters
- **PriceEstimation** - Stored price estimations linked to analyses (NEW)
- **MarketComparable** - Comparable properties for price estimation (NEW)
- NextAuth tables (Account, Session, VerificationToken)
- **PasswordResetToken** - Password recovery tokens (NEW)

Important: Always run `npx prisma generate` after modifying the schema.

### API Routes (`app/api/`)

```
# Authentication
/api/auth/[...nextauth]    - NextAuth handlers (login/logout)
/api/auth/register         - POST: User registration

# Analysis Management (NEW in v2)
/api/analysis              - GET: List user's saved analyses, POST: Save new analysis
/api/analysis/[id]         - GET: Retrieve specific analysis, DELETE: Remove analysis
/api/analysis/import       - POST: Import property data from Idealista/Fotocasa/Pisos.com URL

# Properties (Scraping)
/api/properties            - GET: List/filter properties
/api/properties/[id]       - GET: Single property details
/api/scraper/run           - POST: Manual scraper trigger
/api/scraper/daily         - GET: Cron job endpoint (8am UTC daily)

# User Features
/api/favorites             - GET/POST: User favorites
```

Scraper endpoints are protected - `/scraper/daily` requires `CRON_SECRET` header.
Analysis endpoints require authentication via NextAuth session.

### Frontend (`app/`)

#### Version 2 (v2) - Active Development
Main Pages:
- **Calculator** (`dashboard/page.tsx`) - House flipping investment calculator (PRIMARY FEATURE)
  - URL Import feature for Idealista/Fotocasa/Pisos.com
  - Save/Load/Delete analyses
  - Responsive mobile design
- **Search Agent** (`dashboard/search-agent/page.tsx`) - AI-powered property search
- **Pricing Feed** (`dashboard/pricing/feed/page.tsx`) - Feed reference pricing data (24 Madrid neighborhoods)
- **Pricing Consult** (`dashboard/pricing/consult/page.tsx`) - Query pricing with premium factors
- **Auth Pages** (`auth/login`) - Tab-based login/register with Figma design

Key Components (v2):
- `InputPanel.tsx` - Property data input with URL import
- `CostBreakdown.tsx` - Detailed cost analysis display
- `ResultsSummary.tsx` - Financial metrics and viability indicators
- `MainNav.tsx` - Responsive navigation (Calculator/Search Agent tabs)
- `useHouseFlippingCalculator.ts` - Hook with Madrid 2025 parameters (ITP 6%, renovation 1200€/m², etc.)

#### Version 1 (Legacy)
- **Dashboard** (`dashboard/page.tsx`) - Property browser with map/grid views
- **Property Detail** (`dashboard/properties/[id]/page.tsx`) - Full property details
- `PropertyCard.tsx` - Property display card with badges
- `PropertyMap.tsx` - Mapbox integration with zone circles and property pins

### Environment Variables

Required variables (see `.env.example`):
```
DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
NEXTAUTH_SECRET, NEXTAUTH_URL
NEXT_PUBLIC_MAPBOX_TOKEN
CRON_SECRET
```

Optional: `PROXY_URL`, `USER_AGENT`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`

### Deployment

Configured for Vercel with automatic deployments:
- `vercel.json` defines cron job (daily at 8am UTC)
- Vercel Postgres recommended for database
- GitHub integration for CI/CD
- See `DEPLOYMENT.md` for full deployment guide

## Development Notes

### Testing Scrapers Locally
Scrapers require Playwright browsers installed. If scraping fails, run `npx playwright install`. Note that selectors may break if portal websites update their HTML structure.

### Database Migrations
Always create migrations for schema changes in production:
```bash
npx prisma migrate dev --name descriptive_name
```
Never use `prisma db push` in production.

### Authentication
NextAuth v5 beta uses a different API than v4. Session management is JWT-based. Passwords are hashed with bcryptjs (10 rounds).

### Scraping Considerations
The scrapers include anti-detection measures but may still trigger rate limiting. For production:
- Increase delays between requests
- Consider proxy rotation
- Respect robots.txt
- Monitor for blocking

### Performance
- First build may be slow due to Playwright browser downloads
- Scraping takes 5-10 minutes per execution
- Mapbox has rate limits on free tier
- Consider implementing pagination for properties API

## Project-Specific Guidelines

### Scraper Development
When working with scrapers, always test against actual portal HTML structure first, as selectors are fragile. The project has overcome DataDome protection using playwright-extra with stealth plugins. For Vercel deployment, use @sparticuz/chromium instead of standard Playwright binaries.

### Algorithm Updates
When modifying the scoring algorithm, update both `calculatePropertyScore()` and `meetsMinimumCriteria()` functions to maintain consistency. The calculator uses detailed financial modeling including acquisition costs, renovation estimates, and sale projections.

### Database Management
Database changes require running Prisma generation before the Next.js build will succeed. The schema includes tables for properties, pricing data, user favorites, and search criteria. Always test database migrations locally before deploying.

### Current Development Focus (Nov 2025)

**Active Work:** Version 2 (v2) on port 3001
- **Primary Feature**: House Flipping Calculator with URL import capability
- **Recent Additions**:
  - Import property data directly from Idealista/Fotocasa/Pisos.com URLs
  - Save/load/delete investment analyses with database persistence
  - Mobile-responsive navigation and layouts
  - Comprehensive database setup guide (SETUP_DATABASE.md)
  - Hydration error fixes for React 19

**Architecture**: Calculator-first approach with pricing database as supporting infrastructure. V2 uses new Figma-based design system while maintaining backward compatibility with v1's scraping and search features.

## Quick Start for Local Development

### Version 2 (Recommended - Active Development)
```bash
cd house-flipper-agent-v2
npm install
npx prisma generate
npx prisma db push  # or: npx prisma migrate dev
npm run dev
```

Access at: **http://localhost:3001**

### Version 1 (Legacy)
```bash
cd house-flipper-agent
npm install
npx prisma generate
npm run dev
```

Access at: **http://localhost:3000**

### Database Setup (First Time Only)
See `SETUP_DATABASE.md` for complete setup instructions with:
- Neon (recommended, free PostgreSQL serverless)
- Supabase (alternative free option)
- Local PostgreSQL installation

Default test user credentials (if seeded):
- Email: test@example.com
- Password: test123

## Project Structure Summary

```
house-flipper-agent-v2/           # VERSION 2 (ACTIVE) - Port 3001
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # House Flipping Calculator (main feature)
│   │   ├── search-agent/         # Property search (moved from root)
│   │   └── pricing/
│   │       ├── feed/             # Feed pricing data (24 neighborhoods)
│   │       └── consult/          # Query pricing with premium factors
│   ├── auth/login/               # Tab-based auth (Figma design)
│   └── api/
│       ├── analysis/             # NEW: Save/load/import analyses
│       ├── auth/
│       ├── properties/
│       └── scraper/
├── components/
│   ├── house-flipping/           # NEW: Calculator components
│   │   ├── InputPanel.tsx        # With URL import
│   │   ├── CostBreakdown.tsx
│   │   └── ResultsSummary.tsx
│   ├── navigation/
│   │   └── MainNav.tsx           # NEW: Responsive nav
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── useHouseFlippingCalculator.ts  # NEW: Madrid 2025 params
├── prisma/
│   └── schema.prisma             # Updated with FlippingAnalysis model
└── SETUP_DATABASE.md             # NEW: Database setup guide

house-flipper-agent/              # VERSION 1 (LEGACY) - Port 3000
├── app/
│   ├── dashboard/                # Property browser with map
│   └── api/
├── lib/
│   ├── scraper/                  # Playwright scrapers
│   ├── scoring/                  # Property scoring
│   └── utils/                    # Zone management
└── prisma/                       # Shared schema

SETUP_DATABASE.md                 # Comprehensive DB setup guide
```

## Latest Changes Summary (Nov 1, 2025)

### Commits Applied:
1. **140615a** - "fix: resolve hydration error and add database setup guide"
   - Added suppressHydrationWarning to app/layout.tsx for React 19 compatibility
   - Created comprehensive SETUP_DATABASE.md with Neon/Supabase/Local options

2. **5ee9599** - "feat: Complete House Flipping Calculator enhancements"
   - Implemented URL importer (/api/analysis/import) for Idealista/Fotocasa/Pisos.com
   - Extracts price and surface automatically, fallback to database
   - Added saved analyses management (load/delete/view)
   - Improved mobile responsive UI with adaptive navigation
   - Visual indicators for currently loaded analysis with ROI/viability

3. **d6f13d0** - "feat: Implement House Flipping Calculator as main feature"
   - Added FlippingAnalysis model to Prisma schema
   - Created MainNav component with Calculator/Search Agent tabs
   - Moved search to /dashboard/search-agent
   - Implemented complete calculator with Madrid 2025 parameters:
     * ITP: 6%
     * Renovation: 1200€/m²
     * ICIO: 4%
     * Corporate tax: 25%
   - API endpoints: /api/analysis, /api/analysis/[id]
   - Hook: useHouseFlippingCalculator with full cost modeling

### Key Features Added:
- **URL Import**: Paste Idealista/Fotocasa/Pisos.com URLs to auto-fill property data
- **Analysis Persistence**: Save, load, and delete investment analyses
- **Mobile Optimization**: Responsive navigation and adaptive layouts
- **Database Guide**: Step-by-step setup for Neon, Supabase, or local PostgreSQL
- **Hydration Fix**: Resolved React 19 browser extension conflicts

### Files Modified:
- `prisma/schema.prisma` - Added FlippingAnalysis, PriceEstimation, MarketComparable models
- `app/layout.tsx` - Added suppressHydrationWarning
- `app/dashboard/page.tsx` - Complete calculator implementation with URL import
- `app/api/analysis/` - New endpoints for CRUD operations
- `components/house-flipping/` - InputPanel, CostBreakdown, ResultsSummary
- `components/navigation/MainNav.tsx` - Responsive tab navigation
- `hooks/useHouseFlippingCalculator.ts` - Financial modeling hook
- `SETUP_DATABASE.md` - Comprehensive database setup guide
