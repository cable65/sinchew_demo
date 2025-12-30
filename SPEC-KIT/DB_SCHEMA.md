# Database Schema

This document describes the database schema for the News Aggregator CMS.

## ER Diagram (Mermaid)

```mermaid
erDiagram
    Tenant ||--o{ User : "has"
    Tenant ||--o{ NewsSource : "manages"
    Tenant ||--o{ Article : "owns"
    User ||--o{ Article : "creates"
    NewsSource ||--o{ Article : "produces"

    Tenant {
        string id PK
        string name
        string slug UK
        json brandingConfig
        json systemConfig
        datetime createdAt
        datetime updatedAt
    }

    User {
        string id PK
        string email UK
        string name
        string password
        string tenantId FK
        enum role
        datetime createdAt
        datetime updatedAt
    }

    NewsSource {
        string id PK
        string tenantId FK
        string name
        string baseUrl
        string description
        enum type
        string category
        enum updateFrequency
        datetime lastFetchedAt
        string credentials
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Article {
        string id PK
        string tenantId FK
        string sourceId FK
        string creatorId FK
        string title
        string link
        string guid
        string description
        string content
        string imageUrl
        datetime publishedAt
        datetime fetchedAt
        string author
        string[] tags
        enum status
        boolean editorialLock
        string slug
        string seoTitle
        string seoDescription
        string seoKeywords
        string canonicalUrl
        string ogTitle
        string ogDescription
        string ogImageUrl
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        string id PK
        datetime timestamp
        string actorId
        string actorRole
        string action
        string resourceType
        string resourceId
        string ipAddress
        string userAgent
        json oldValue
        json newValue
        json metadata
    }
```

## Model Descriptions

### Tenant
Represents an organization using the platform.
- `brandingConfig`: JSON storing logo URL, colors, platform name, etc.
- `systemConfig`: JSON storing global settings like AI model preference.

### User
Users belonging to a tenant.
- `role`: ADMIN, EDITOR, or VIEWER.
- `name`: Display name.

### NewsSource
External sources (RSS, API) configured for ingestion.

### Article
The core content unit.
- `creatorId`: The user who created or last modified the article (if manual).
- `editorialLock`: Prevents automated updates from overwriting manual edits.

### AuditLog
Immutable record of all system actions.
