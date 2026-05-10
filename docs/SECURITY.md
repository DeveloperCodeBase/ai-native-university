# Security Practices

## Authentication

- JWT-based authentication with access + refresh tokens
- Bcrypt password hashing (12 rounds)
- Token expiry: access 15min, refresh 7d
- `JwtAuthGuard` required on all protected endpoints

## Authorization (RBAC)

| Role | Level | Access |
|------|-------|--------|
| super_admin | 1 | Full access, bypass tenant |
| admin | 2 | Full tenant access |
| instructor | 3 | Own courses + assigned students |
| teaching_assistant | 4 | Assigned course access |
| student | 5 | Own data + enrolled courses |

- `RolesGuard` + `@Roles()` decorator on all controllers
- Role checked at controller level, tenant at service level

## Multi-Tenancy Isolation

- Every service method accepts `tenantId` as first argument
- All database queries include `WHERE tenantId = ?`
- `super_admin` role can bypass tenant restrictions
- Cross-tenant access is architecturally prevented

## Secret Management

- Secrets stored in `.env` on VPS only
- `.env` is in `.gitignore` — never committed
- `.env.example` has safe placeholder values
- API keys read from environment variables at runtime
- No hardcoded secrets in source code

## API Security

- CORS configured per environment
- Request correlation IDs for tracing
- Input validation via NestJS class-validator + Swagger
- Rate limiting planned (Redis-based)

## AI Security

- AI Gateway authenticated via internal API key
- All AI outputs logged for audit
- AI never makes final decisions (human review required)
- Model and provider recorded in every interaction

## Docker Security

- Non-root containers where possible
- Internal service communication via Docker network
- Only nginx exposes port 3010 externally
- Database not exposed externally

## Future Enhancements

- [ ] HTTPS via Let's Encrypt
- [ ] Rate limiting middleware
- [ ] Account lockout after failed attempts
- [ ] 2FA for admin accounts
- [ ] CSP headers
- [ ] Regular dependency audits
