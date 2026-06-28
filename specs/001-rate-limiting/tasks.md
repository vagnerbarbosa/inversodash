# Rate Limiting Tasks

## Infrastructure Setup

- [ ] **TASK-001**: Import and initialize slowapi Limiter in main.py
  - Add imports: `from slowapi import Limiter, _rate_limit_exceeded_handler`
  - Add: `from slowapi.util import get_remote_address`
  - Add: `from slowapi.errors import RateLimitExceeded`
  - Initialize: `limiter = Limiter(key_func=get_remote_address)`
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Configure FastAPI app with rate limiter
  - Set: `app.state.limiter = limiter`
  - Add exception handler: `app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)`
  - Size: Small
  - Dependencies: TASK-001

## Endpoint Protection

- [ ] **TASK-003**: Add global rate limit decorator to FastAPI app
  - Apply `@limiter.limit("100/minute")` to all routes via decorator
  - Size: Medium
  - Dependencies: TASK-002

- [ ] **TASK-004**: Implement stricter limits for authentication endpoints
  - Create auth-specific limit: `@limiter.limit("5/5minutes")`
  - Apply to login/token endpoints
  - Size: Small
  - Dependencies: TASK-003

- [ ] **TASK-005**: Configure export endpoint limits
  - Apply: `@limiter.limit("10/minute")` to data export endpoints
  - Size: Small
  - Dependencies: TASK-003

## WebSocket Protection

- [ ] **TASK-006**: Implement WebSocket message rate limiting
  - Add per-connection message counter with timestamp tracking
  - Close connection with code 1008 if limit exceeded
  - Implement sliding window for message tracking
  - Size: Medium
  - Dependencies: TASK-002

- [ ] **TASK-007**: Add rate limit error handling to WebSocket
  - Send error message before closing connection
  - Include retry-after information
  - Size: Small
  - Dependencies: TASK-006

## Testing

- [ ] **TASK-008**: Write unit tests for rate limiting
  - Test 429 response on limit exceeded
  - Test header presence in responses
  - Test different endpoint categories
  - Size: Medium
  - Dependencies: TASK-004, TASK-005, TASK-006

- [ ] **TASK-009**: Perform load testing
  - Benchmark latency overhead
  - Verify concurrent request handling
  - Document performance results
  - Size: Small
  - Dependencies: TASK-008

## Documentation

- [ ] **TASK-010**: Update API documentation
  - Document rate limits per endpoint category
  - Include 429 response in OpenAPI spec
  - Add rate limit headers to documentation
  - Size: Small
  - Dependencies: TASK-004, TASK-005
