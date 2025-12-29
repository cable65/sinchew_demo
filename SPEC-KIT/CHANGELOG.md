# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 15, React 19, TypeScript, Tailwind CSS.
- SPEC-KIT initialization (SPEC, AUDIT, SCHEMA, SECURITY).
- Prisma ORM setup.
- Audit Logging infrastructure (`audit_logs` table).
- News Source Management module (backend schema).
- Multi-tenancy foundation (Tenant/User schema).
- Deployment configurations (Docker, K8s, CI/CD).
- Tenant Registration API with Audit Logging.
- News Source Management API with Audit Logging.
- Password hashing using bcrypt for Tenant Admin creation.
- Health Check Endpoint (`/api/health`).
- JWT Authentication system (`lib/auth.ts`, `/api/auth/login`).
- Protected `GET/POST /api/sources` using JWT.
- Frontend Scaffolding:
  - Shadcn/UI compatible components (Button, Input, Card, Label).
  - Login Page (`/login`) with JWT integration.
  - Dashboard Layout (`Sidebar`, `Header`) and Overview Page (`/dashboard`).
  - Source Management UI (`/dashboard/sources`, `/dashboard/sources/create`) with "Sync Now" functionality.
  - Audit Log Viewer (`/dashboard/admin/audit-logs`) with filtering and pagination.
  - Middleware for route protection.

### Added
- **RSS Fetcher Service**: Basic service to parse RSS feeds using `rss-parser`.
- **Sync API**: `POST /api/sources/[id]/sync` to manually trigger feed updates.
- **Audit Log API**: `GET /api/admin/audit-logs` for retrieving system logs.

### Changed
- Source Create UI: Frequency options aligned with schema (Hourly/Daily/Weekly).

### New
- **Articles Model**: Added `articles` table with relations to tenants and sources.
- **Articles API**: `GET /api/articles` with pagination, search, and source filter.
- **Articles Page**: `/dashboard/articles` to browse ingested articles.
- Sync now persists RSS items into `articles` with dedup on `(tenant_id, link)`.
- **Article Editing**: Added `GET/PATCH /api/articles/{id}` for editing title/description/content/image.
- **Edit UI**: Added `/dashboard/articles/[id]` page and Edit link in list.
- **SEO & Custom Fields**: Extended Article model with slug, author, tags, status, editorial lock, and SEO fields (title, description, keywords, canonical URL, OG fields). Updated edit API and UI to manage these.
- **Create Article**: Added `/dashboard/articles/create` page and `POST /api/articles` endpoint for manual article creation.
- **Articles Table**: Refactored Articles list to use a Table layout with status badges.
- **AI Integration**: Added AI Service using DeepSeek/OpenAI for:
  - **Auto-Generate SEO**: Generates SEO title, description, and keywords based on article content.
  - **Grammar Check**: Proofreads content for grammar/typos (Chinese/English support).
  - Added new audit log actions: `AI_SEO_GENERATE`, `AI_GRAMMAR_CHECK`.

### Fixed
- TypeScript build errors in API routes.
- Prisma Client initialization for PostgreSQL adapter.
- **Sync API Robustness**:
  - Implemented raw SQL fallback for bulk inserts to bypass `createMany` limitations in some environments.
  - Fixed "null id" constraint violation in raw SQL inserts by generating UUIDs manually.
  - Added XML parsing fallback in RSS service for better compatibility.
  - Improved error handling and user feedback in Source Management UI.
- **Client Component Props**: Fixed `net::ERR_ABORTED` in Article Edit page by switching from `params` prop to `useParams` hook for Next.js 15 compatibility.
