# API Contract

## Specification
**OpenAPI 3.1 Spec**: [public/openapi.yaml](../public/openapi.yaml)
This project follows the OpenAPI 3.1 standard. Please refer to the YAML file for the most up-to-date documentation.

## Base URL
`/api`

## Security & Middleware
- **Rate Limiting**: 100 requests per minute per IP (Middleware enforced).
- **CORS**: Allowed for all origins (configurable).
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, etc.

## Authentication
- **Type**: Bearer Token (JWT) or Cookie (`token`)
- **Header**: `Authorization: Bearer <token>`

## Response Format
All API responses follow this standard JSON structure:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "error": null
}
```

## Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/auth/login` | User login (returns JWT + HttpOnly Cookie) | No |

### Health & Monitoring
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/health` | System health status (Database connection check) | No |
| GET/POST | `/graphql` | GraphQL Endpoint (Placeholder) | No |

### Tenants

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
