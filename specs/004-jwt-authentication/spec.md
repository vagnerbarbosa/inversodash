# JWT Authentication

## Summary

Implement JWT-based authentication and authorization to secure API endpoints and WebSocket connections with role-based access control.

## Motivation

Currently, the application has no authentication mechanism:
- Anyone can access API endpoints
- No user session management
- No audit trail of who accessed what
- Cannot implement user-specific features

## Functional Requirements

1. **Login**: Username/password authentication with JWT token generation
2. **Token Refresh**: Automatic token refresh before expiration
3. **Protected Routes**: Middleware to secure API endpoints
4. **WebSocket Auth**: JWT validation for WebSocket connections
5. **Role-Based Access**: Admin and Viewer roles with different permissions
6. **Logout**: Token invalidation and session termination

## Non-Functional Requirements

1. **Security**: Tokens expire in 15 minutes, refresh tokens in 7 days
2. **Performance**: Token validation < 1ms overhead
3. **Stateless**: No server-side session storage required
4. **HTTPS Only**: Tokens only transmitted over HTTPS

## Technical Design

### JWT Claims Structure

```json
{
  "sub": "user123",
  "username": "admin",
  "role": "admin",
  "iat": 1640995200,
  "exp": 1640996100
}
```

### Roles and Permissions

| Role | Permissions |
|------|-------------|
| admin | Full access: read, write, configure, manage users |
| viewer | Read-only: view dashboard, cannot modify settings |

### Implementation Details

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username
```

## Success Criteria

1. Login endpoint returns valid JWT token
2. Protected endpoints reject requests without valid token
3. WebSocket connections require token validation
4. Token refresh mechanism working
5. Role-based access control enforced
6. Tokens expire correctly and require re-authentication

## Out of Scope

- OAuth2 / Social login integration
- Multi-factor authentication
- Password reset flow
- User registration (single admin setup)
