# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2025-12-30

### Fixed
- **Deployment**:
  - Fixed TypeScript error in `src/lib/audit.ts` where `Record<string, unknown>` was incompatible with Prisma's `InputJsonValue`.
  - Resolved `Next.js build worker exited with code: 1` during Vercel deployment.

## [0.1.4] - 2025-12-30

### Added
- **Category Management**:
  - Replaced static `ArticleCategory` enum with dynamic `Category` database model for flexible management.
  - **API**: Added `GET/POST/PATCH/DELETE /api/admin/categories` for full CRUD operations.
  - **UI**: Added Category Management page (`/dashboard/admin/categories`) for Admins.
  - **Public API**: Added `GET /api/categories` for listing categories in frontend forms.
- **Article Enhancements**:
  - **Editorial Lock**: Implemented strict locking mechanism. Locked articles cannot be modified unless explicitly unlocked by an Admin/Editor.
  - **Image Upload**: Added file upload capability with validation (Recommended: 1200x630px, Max 2MB).
  - **Dynamic Categories**: Article Create/Edit forms now fetch categories dynamically from the database.
  - **Tag/Keyword Sync**: Implemented bidirectional synchronization between "Tags" and "SEO Keywords" fields.
- **Access Control**:
  - **Role-Based Navigation**: Sidebar now dynamically filters links based on user role (e.g., "Categories", "Users", "Audit Logs" are hidden for non-Admins).

### Fixed
- **Category Management**:
  - Fixed "Internal Server Error" (500) in Category Management API and Page.
  - Added missing `categories` relation to `Tenant` model in Prisma schema.
  - Improved error handling in `GET/POST /api/admin/categories` and `GET /api/categories` to return descriptive error messages.

### Changed
- **Database Schema**:
  - Removed `ArticleCategory` enum.
  - Added `Category` model with relation to `Tenant` and `Article`.
  - Updated `Article` model to use `categoryId` foreign key.
- **Article API**:
  - Updated `PATCH /api/articles/[id]` to enforce Editorial Lock logic.
  - Updated `POST/PATCH` endpoints to handle `categoryId` relation.

## [0.1.3] - 2025-12-30

### Added
- **Platform Branding**:
  - Added "Platform Name" configuration to Organization Settings (Admin only).
  - Implemented dynamic **Footer** in Dashboard Layout.
  - Footer displays the configured Platform Name (or Tenant Name/Default) and dynamic Copyright Year.
  - Updated **Sidebar** to display the configured Platform Name instead of hardcoded "SinChew CMS".
- **Responsive Layout**:
  - Implemented responsive Sidebar behavior.
  - Sidebar is now hidden on mobile screens.
  - Added **MobileSidebar** (hamburger menu) to the Header for mobile navigation.
- **Development**:
  - Pre-filled Login form with default Admin credentials for easier testing.
- **Mobile Responsiveness**:
  - **Articles Page**:
    - Optimized layout for mobile devices.
    - Added horizontal scrolling for data tables with `w-full` constraint.
    - Made "Actions" column **sticky** to the right for easy access on mobile.
    - Selectively hide less critical columns (Author, Published Date) on smaller screens.
    - Stacked search and action buttons on mobile.
  - **Audit Logs Page**:
    - Optimized layout for mobile devices.
    - Added horizontal scrolling for data tables with `w-full` constraint.
    - Selectively hide less critical columns (Resource, IP, Details) on smaller screens.
    - Improved header layout for mobile.
  - **Dashboard Layout**:
    - Reduced padding on mobile (`p-4` vs `p-6`) to maximize content area.
    - Constrained main content width to prevent overflow issues.
- **Documentation**:
  - Updated SPEC.md to include Platform Naming in Organization Settings.

## [0.1.2] - 2025-12-29

### Added (Settings & Dashboard)
- **Settings Page**: Full implementation of user and tenant settings.
  - Profile: Update display name.
  - Security: Change password with validation.
  - Organization (Admin): Update name and branding (logo, switch).
  - System (Admin): Configure AI model and auto-publish settings.
- **API**:
  - `GET/PUT /api/user/profile`: Manage user profile.
  - `PUT /api/user/password`: Change user password.
  - `GET/PUT /api/tenant/settings`: Manage tenant settings (branding, system config).
- **Database**:
  - Added `name` field to `User` model.
  - Added `systemConfig` field to `Tenant` model.
  - Added `DB_SCHEMA.md` to SPEC-KIT.
- **Dashboard Reports**:
  - Added `DashboardStats` component with role-based filtering (Admin vs Editor).
  - Added graph/table toggle and PDF/CSV export.

### Changed
- Updated `SettingsPage` UI to be interactive and connected to real APIs.
- **Article Creation**: Relaxed validation for "DRAFT" status.
  - Frontend: "Save as Draft" skips client-side validation for Title/Link (Source still required).
  - Backend: Auto-fills "Untitled Draft" and placeholder Link if missing for drafts.
  - Allows saving posts without any content verification in Draft mode.
- **Article Editor**: Replaced TinyMCE with **Tiptap** (React 19 Compatible & MIT License).
  - Replaced `RichTextEditor` component with Tiptap implementation.
  - Added custom toolbar with formatting options (Bold, Italic, Headings, Lists, Links, Images).
  - Removed TinyMCE dependencies and assets to resolve license warnings.
  - Tiptap is headless and fully compatible with React 19.
  - Added **Image Upload** (Drag & Drop or File Picker) directly in the editor.
  - Added **Font Styling**: Font Family selector and Text Color picker.
  - Added **Text Alignment**: Left, Center, Right, Justify alignment options.
  - Added **Source View**: Toggle between WYSIWYG and raw HTML source code.
  - Fixed **Preview Styling**: Installed `@tailwindcss/typography` to ensure Headings and Lists render correctly.
- **AI Grammar Check**: Improved UX for grammar suggestions.
  - Updated AI prompt to handle HTML content and return exact HTML snippets for replacement.
  - Added **Replace** button to each grammar issue card in the editor.
  - Implemented automatic text replacement logic in the editor.
  - Improved UI for issue display (truncate long text, better spacing).

### Fixed
- **Article Publishing Date**: Fixed issue where `publishedAt` remained null when updating an article from "DRAFT" to "PUBLISHED". Now automatically sets to current time if missing.
- **Article Update API**: Added `publishedAt` to update schema to allow manual date adjustments.
- **Data Integrity**: Manually backfilled `publishedAt` for existing published articles with missing dates.

## [0.1.1] - 2025-12-29

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
