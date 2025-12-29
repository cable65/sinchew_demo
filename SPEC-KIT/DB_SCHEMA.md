# Database Schema

## ER Diagram (Text Representation)

### Tenant
- `id` (PK)
- `name`
- `slug` (unique)
- `branding_config` (JSON)
- `created_at`
- `updated_at`

### User
- `id` (PK)
- `email` (unique)
- `tenant_id` (FK -> Tenant.id)
- `role` (enum: ADMIN, EDITOR, VIEWER)
- `created_at`

### NewsSource
- `id` (PK)
- `tenant_id` (FK -> Tenant.id)
- `name`
- `base_url`
- `description`
- `type` (enum: NEWS, BLOG, SOCIAL)
- `category`
- `update_frequency` (enum: HOURLY, DAILY, WEEKLY)
- `last_fetched_at`
- `credentials` (Encrypted)
- `is_active`

### AuditLog
- `id` (PK)
- `timestamp`
- `actor_id`
- `actor_role`
- `action`
- `resource_type`
- `resource_id`
- `ip_address`
- `user_agent`
- `old_value` (JSON)
- `new_value` (JSON)
- `metadata` (JSON)

## Implementation Notes
- **Prisma** will be used as the ORM.
- **PostgreSQL** is the database engine.
- **RLS** (Row Level Security) is handled at the application layer via Prisma middleware/extensions for multi-tenancy.

### Article
- `id` (PK)
- `tenant_id` (FK -> Tenant.id)
- `source_id` (FK -> NewsSource.id)
- `title`
- `link` (unique per tenant)
- `guid`
- `description`
- `content`
- `image_url`
- `published_at`
- `fetched_at`
- `created_at`

Indexes:
- `idx_article_source_id`
- `idx_article_tenant_published_at`
- Unique: `(tenant_id, link)`
