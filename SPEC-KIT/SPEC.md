# Product Specification: News Aggregator CMS Platform

## 1. Overview
A comprehensive, multi-tenant news aggregator CMS platform designed for scalability, security, and auditability. The system allows organizations (tenants) to manage news sources, aggregate content, and distribute it via API.

## 2. Core Architecture
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Next.js API Routes (Serverless/Edge compatible).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Clerk / NextAuth (Tenant-aware).
- **Infrastructure**: Docker, Kubernetes ready.

## 3. Key Modules

### 3.1 Multi-Tenancy
- **Isolation**: Row-level security (RLS) simulation via Prisma middleware/filters.
- **Tenant Management**: Onboarding, branding, billing integration, platform naming.
- **Roles**: Admin, Editor, Viewer.

### 3.2 News Source Management
- **Source Metadata**: Name, URL, Description, Type (News/Blog/Social), Category.
- **Monitoring**: Health checks, Last fetch timestamp.
- **Security**: Encrypted credentials for authenticated sources.

### 3.3 Content Aggregation
- **Fetching**: Background jobs (to be implemented via BullMQ or Inngest).
- **Storage**: Normalized content structure.

### 3.4 API & Distribution
- **REST API**: OpenAPI 3.0 compliant.
- **Security**: API Key management, Rate limiting.
- **Webhooks**: Event-driven notifications.

### 3.5 Article Management
- **Creation**: Supports manual creation and automated ingestion (RSS).
- **Draft Mode**: Allows saving drafts with minimal validation (auto-fills required DB fields with placeholders).
- **Publishing**: Enforces strict validation (Title, Link required) before status transition to PUBLISHED.
- **Editing**: Full WYSIWYG editing using **Tiptap** (Headless, React-friendly, MIT) with version history (via Audit Logs).
  - **Features**: 
    - Text Formatting: Bold, Italic, Strike, Headings (H1-H3).
    - Alignment: Left, Center, Right, Justify.
    - Advanced Styling: Font Family (Arial, Georgia, etc.), Text Color.
    - Media: Image Upload (Local & URL), Link management.
    - Lists: Bullet, Ordered.
    - View Modes: Visual Editor & Source Code View (with toggle).
- **Category Management**:
  - Dynamic category creation and management per tenant.
  - Admin interface for adding/removing categories.
- **Editorial Controls**:
  - **Editorial Lock**: Articles can be locked to prevent accidental or unauthorized edits.
  - **Image Upload**: Integrated image uploading with validation for optimized web delivery (1200x630px, <2MB).
  - **SEO Sync**: Automatic bidirectional synchronization between Article Tags and SEO Keywords.
- **AI Grammar Check**:
  - Analyzes HTML content for errors and improvements.
- **Dashboard & Reporting**:
  - **Admin View**:
    - Total articles statistics (Today, 7d, 30d, 365d, All).
    - Breakdown by Content Status.
  - **Editor View**:
    - "My Articles" statistics (Today, 7d, 30d, 365d, All).
    - Breakdown of own articles by Content Status.
  - **Display**: Toggle between Graph (Charts) and Table views.
  - **Export**: PDF and CSV export options for reports.
  - Returns structured issues with one-click "Replace" functionality.
  - Handles HTML tags intelligently during replacement.
- **Settings Management**:
  - **Profile Settings** (All Users):
    - Update Display Name.
    - Change Password (Securely hashed).
    - Notification Preferences.
  - **Organization Settings** (Admin Only):
    - Site Name & Description.
    - Branding (Logo URL, Primary Color).
    - Platform Name (displayed in Dashboard Footer).
    - Timezone & Date Format.
  - **System Configuration** (Admin Only):
    - AI Model Configuration.
    - Content Ingestion Rules (Default frequency).
- **SEO**: Dedicated fields for SEO metadata and OpenGraph tags.

## 4. Non-Functional Requirements
- **Performance**: <500ms API response (95th percentile).
- **Reliability**: 99.9% Uptime.
- **Security**: OWASP Top 10 mitigation, Audit Logging for ALL write operations.
