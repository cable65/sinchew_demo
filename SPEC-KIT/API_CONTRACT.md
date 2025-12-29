# API Contract

## Base URL
`/api`

## Authentication
- **Type**: Bearer Token (JWT) or Cookie (`token`)
- **Header**: `Authorization: Bearer <token>`

## Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/auth/login` | User login (returns JWT + HttpOnly Cookie) | No |

### Health
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/health` | System health status (Database connection check) | No |

### Tenants
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/tenants` | Register new tenant + Admin user | No (System level) |

### News Sources
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/sources` | List all news sources for the current tenant | Yes |
| POST   | `/sources` | Create a new news source | Yes (Admin/Editor) |
| POST   | `/sources/{id}/sync` | Manually sync a source and ingest articles | Yes |

### Audit (Admin Only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/admin/audit-logs` | Retrieve audit logs (Not yet exposed via API) | Yes (Admin) |

### Articles
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/articles` | List articles for current tenant (pagination, search, filter by source) | Yes |

## Data Models (JSON)

### NewsSource
```json
{
  "id": "uuid",
  "name": "TechCrunch",
  "baseUrl": "https://techcrunch.com",
  "type": "NEWS",
  "category": "Technology",
  "updateFrequency": "HOURLY",
  "lastFetchedAt": "2024-01-01T12:00:00Z"
}
```

### Article
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "sourceId": "uuid",
  "title": "Example headline",
  "link": "https://example.com/article",
  "guid": "optional",
  "description": "summary",
  "content": "full text optional",
  "imageUrl": "https://example.com/image.jpg",
  "publishedAt": "2025-12-29T02:06:51Z",
  "fetchedAt": "2025-12-29T03:00:00Z"
}
```

### Tenant
```json
{
  "id": "uuid",
  "name": "Demo Org",
  "slug": "demo-org",
  "brandingConfig": {}
}
```
