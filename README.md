# Sinchew Demo - Enterprise News Aggregator & CMS

**Sinchew Demo** is a production-grade, multi-tenant Content Management System (CMS) and News Aggregator built with modern web technologies. It is designed to handle high-volume article ingestion, editorial workflows, and AI-powered content enhancement with strict audit compliance.

![Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_Prisma_|_PostgreSQL-blue)
![License](https://img.shields.io/badge/License-Private-red)

## 🚀 Key Features

### 🏢 Multi-Tenancy & Security
- **Tenant Isolation**: Strict data segregation per tenant using `tenantId`.
- **RBAC System**: Granular roles (`ADMIN`, `EDITOR`, `VIEWER`) for access control.
- **Secure Auth**: JWT-based authentication with secure cookie handling.

### 📝 Content Management
- **Article Editor**: Full-featured editor with support for custom fields (Author, Tags, Slug).
- **SEO Management**: dedicated fields for SEO titles, descriptions, canonical URLs, and OpenGraph tags.
- **Editorial Workflow**: Status tracking (`DRAFT`, `PUBLISHED`, `ARCHIVED`) and Editorial Locking.

### 🤖 AI-Powered Workflows
Integrated with **DeepSeek / OpenAI** to accelerate editorial tasks:
- **Auto-Generate SEO**: One-click generation of SEO-optimized titles, descriptions, and keywords.
- **Grammar & Style Check**: Intelligent proofreading for English and Chinese content.

### 📊 Audit & Compliance
- **Tamper-Evident Logging**: Every sensitive action (login, create, update, delete) is recorded in an immutable `audit_logs` table.
- **Admin Dashboard**: Searchable and filterable audit trail for compliance reviews.

### 📰 News Aggregation
- **RSS Ingestion**: Automated fetching and parsing of RSS feeds from configured sources.
- **Deduplication**: Smart logic to prevent duplicate article ingestion.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15 (App Router)](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **Backend**: Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/)
- **AI**: DeepSeek API / OpenAI API
- **Infrastructure**: Docker, Kubernetes (Manifests included)

## 📂 Project Structure

```
├── SPEC-KIT/           # 📘 Project Specifications & Documentation
│   ├── SPEC.md         # Full Product Spec & User Stories
│   ├── API_CONTRACT.md # API Endpoint Definitions
│   ├── DB_SCHEMA.md    # Database Schema Documentation
│   ├── SECURITY.md     # Security Protocols & Threat Model
│   └── AUDIT_REQUIREMENTS.md # Audit Log Standards
├── prisma/             # Database Schema & Migrations
├── src/
│   ├── app/            # Next.js App Router Pages & API
│   ├── components/     # Reusable UI Components
│   ├── lib/            # Shared Utilities (AI, Auth, Prisma)
│   └── middleware.ts   # Auth & Multi-tenancy Middleware
└── ...
```

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- OpenAI or DeepSeek API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd sinchew_demo
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/sinchew_db"
    JWT_SECRET="your-super-secret-key"
    
    # AI Configuration (DeepSeek or OpenAI)
    OPENAI_API_KEY="your-api-key"
    DEEPSEEK_API_KEY="your-deepseek-key"
    PREFERRED_AI="deepseek" # or "openai"
    ```

4.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma db push
    npx prisma db seed # Seeds initial tenant & admin user
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Access the app at `http://localhost:3000`.

## 📚 Documentation

Detailed documentation is maintained in the `SPEC-KIT` directory:
- [Product Specification](SPEC-KIT/SPEC.md)
- [API Contract](SPEC-KIT/API_CONTRACT.md)
- [Database Schema](SPEC-KIT/DB_SCHEMA.md)
- [Security Guidelines](SPEC-KIT/SECURITY.md)
- [Changelog](SPEC-KIT/CHANGELOG.md)

## 🤝 Contributing

Please follow the **Change Management Discipline**:
1.  Update `SPEC-KIT` documents for any requirement change.
2.  Ensure all sensitive operations are audit-logged.
3.  Run tests before committing.

## 📄 License

Proprietary & Confidential.
