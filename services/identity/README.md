# Identity Service

Authentication, authorization, and user management service.

## Bounded Context

User Identity and Access Management

## Responsibilities

- User registration and authentication
- JWT token generation and validation
- Password management (reset, change)
- OAuth integration (Google, GitHub, etc.)
- User profile management
- Role-based access control (RBAC)
- Session management

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express or NestJS
- **Database:** PostgreSQL (user data)
- **Cache:** Redis (sessions, tokens)
- **Auth:** Passport.js, JWT
- **Password:** bcrypt

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### User Roles Table
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);
```

### OAuth Providers Table
```sql
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/verify-email/:token` - Verify email address

### OAuth
- `GET /auth/oauth/:provider` - Initiate OAuth flow
- `GET /auth/oauth/:provider/callback` - OAuth callback

### User Profile
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account
- `PATCH /users/me/password` - Change password

### Admin (RBAC)
- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user by ID (admin only)
- `PATCH /users/:id/status` - Activate/deactivate user (admin only)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aurora_identity

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth - Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/oauth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/oauth/github/callback

# Email (for verification & password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Service
PORT=5000
NODE_ENV=development
```

## Events Published

- `UserRegistered`
- `UserLoggedIn`
- `UserLoggedOut`
- `UserProfileUpdated`
- `UserDeleted`
- `PasswordChanged`

## Security Considerations

1. **Password Storage**: Use bcrypt with salt rounds ≥ 12
2. **JWT**: Short-lived access tokens (15min), longer refresh tokens (7d)
3. **Rate Limiting**: Implement on login/register endpoints
4. **CORS**: Configure properly for frontend domain
5. **Input Validation**: Validate and sanitize all inputs
6. **SQL Injection**: Use parameterized queries
7. **Session Storage**: Store refresh tokens in Redis with expiry
8. **Email Verification**: Required before full account access
9. **Account Lockout**: After N failed login attempts

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npm run db:migrate

# Seed default roles
npm run db:seed

# Development
npm run dev

# Production
npm run build
npm start
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Monitoring

- Health check: `GET /health`
- Metrics: `GET /metrics` (Prometheus format)

