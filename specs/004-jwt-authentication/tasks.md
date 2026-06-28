# JWT Authentication Tasks

## Dependencies

- [ ] **TASK-001**: Add JWT dependencies
  - Add `python-jose[cryptography]` to requirements.txt
  - Add `passlib[bcrypt]` to requirements.txt
  - Add `python-multipart` for form handling
  - Size: Small
  - Dependencies: None

## Backend Services

- [ ] **TASK-002**: Create JWT configuration
  - Create `backend/core/config.py` for JWT settings
  - Load SECRET_KEY from environment
  - Configure ALGORITHM (HS256) and expiration times
  - Size: Small
  - Dependencies: None

- [ ] **TASK-003**: Implement password hashing
  - Create `backend/services/auth.py`
  - Implement hash_password using bcrypt
  - Implement verify_password function
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-004**: Create token generation
  - Implement create_access_token function
  - Implement create_refresh_token function
  - Add user claims (sub, username, role)
  - Size: Small
  - Dependencies: TASK-002

- [ ] **TASK-005**: Create token validation
  - Implement decode_token function
  - Handle JWTError exceptions
  - Return payload or raise HTTPException
  - Size: Small
  - Dependencies: TASK-004

## API Endpoints

- [ ] **TASK-006**: Create login endpoint
  - POST /api/auth/login
  - Accept username/password
  - Return access_token and refresh_token
  - Size: Medium
  - Dependencies: TASK-003, TASK-004

- [ ] **TASK-007**: Create token refresh endpoint
  - POST /api/auth/refresh
  - Accept refresh_token
  - Return new access_token
  - Size: Small
  - Dependencies: TASK-005

- [ ] **TASK-008**: Create get current user dependency
  - Create `backend/dependencies/auth.py`
  - Implement get_current_user function
  - Extract and validate token from Authorization header
  - Size: Medium
  - Dependencies: TASK-005

- [ ] **TASK-009**: Create role checking dependency
  - Implement require_role decorator/dependency
  - Check role claim against required roles
  - Return 403 if insufficient permissions
  - Size: Small
  - Dependencies: TASK-008

## WebSocket Authentication

- [ ] **TASK-010**: Implement WebSocket token validation
  - Extract token from WebSocket query params
  - Validate token on connect
  - Close connection with code 1008 if invalid
  - Size: Medium
  - Dependencies: TASK-005

## Frontend Integration

- [ ] **TASK-011**: Create AuthContext
  - Create `frontend/src/contexts/AuthContext.jsx`
  - Manage token state
  - Provide login/logout functions
  - Size: Medium
  - Dependencies: None

- [ ] **TASK-012**: Create Login component
  - Username/password form
  - API integration for login
  - Error handling for invalid credentials
  - Size: Medium
  - Dependencies: TASK-011

- [ ] **TASK-013**: Implement API client with auth
  - Add Authorization header interceptor
  - Handle 401 responses (redirect to login)
  - Implement automatic token refresh
  - Size: Medium
  - Dependencies: TASK-011, TASK-007

- [ ] **TASK-014**: Protect routes
  - Create ProtectedRoute component
  - Redirect to login if not authenticated
  - Check role permissions
  - Size: Small
  - Dependencies: TASK-012

## User Management

- [ ] **TASK-015**: Create initial admin user script
  - Script to create admin user on startup
  - Read credentials from environment
  - Store hashed password in config/userdb
  - Size: Small
  - Dependencies: TASK-003

## Testing

- [ ] **TASK-016**: Write authentication tests
  - Test login success/failure
  - Test token validation
  - Test protected endpoint access
  - Test role-based access
  - Size: Medium
  - Dependencies: TASK-006, TASK-009

## Documentation

- [ ] **TASK-017**: Document authentication flow
  - API endpoint documentation
  - Token format and claims
  - Frontend integration guide
  - Size: Small
  - Dependencies: All above
