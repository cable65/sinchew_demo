# Audit Logging Requirements

## 1. Policy
All sensitive operations within the system MUST be logged. This is non-negotiable for compliance and security monitoring.

## 2. Schema: `audit_logs`
This table is strictly append-only. No updates or deletes allowed (except via retention policy archival processes).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `timestamp` | DateTime | UTC timestamp of the event |
| `actor_id` | String | User ID or System Service ID |
| `actor_role` | String | Role of the actor at the time of action |
| `action` | String | Enum/String (e.g., `USER_LOGIN`, `SOURCE_CREATE`) |
| `resource_type` | String | The entity being acted upon (e.g., `NewsSource`) |
| `resource_id` | String | ID of the resource |
| `ip_address` | String | Origin IP |
| `user_agent` | String | Client User Agent |
| `old_value` | JSONB | State before change (nullable) |
| `new_value` | JSONB | State after change (nullable) |
| `metadata` | JSONB | Additional context (nullable) |

## 3. Access Control
- **View Access**: Strictly limited to `Admin` role.
- **API**: `GET /admin/audit-logs` only. No public access.
- **Protection**: Logs should be protected from tampering.

## 4. Mandatory Logged Events
- User Authentication (Login, Logout, Failed attempts)
- Tenant Settings Changes
- User Role Changes
- News Source Creation, Update, Deletion
- API Key Generation/Revocation
- Billing/Subscription Changes
