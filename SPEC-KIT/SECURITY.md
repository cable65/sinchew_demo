# Security Policy

## 1. Authentication & Authorization
- **Authentication**: Handled via secure providers (Clerk/NextAuth).
- **Authorization**: RBAC (Role-Based Access Control) enforced at API and Page level.
- **Multi-tenancy**: Strict isolation of tenant data.

## 2. Data Protection
- **Encryption at Rest**: Database encryption where applicable; sensitive credentials (passwords) hashed using bcrypt before storage.
- **Encryption in Transit**: TLS 1.2+ for all communications.

## 3. Auditability
- See `AUDIT_REQUIREMENTS.md`. All write operations are logged.

## 4. Vulnerability Management
- Regular dependency scanning (npm audit).
- OWASP Top 10 mitigation strategies implemented (Sanitization, parameterized queries via Prisma, etc.).

## 5. API Security
- Rate limiting to prevent DoS.
- Input validation (Zod) for all API endpoints.
