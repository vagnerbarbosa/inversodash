# Rate Limiting

## Summary

Implement rate limiting for the FastAPI backend to prevent abuse and ensure fair resource usage across all API endpoints and WebSocket connections.

## Motivation

Currently, the API has no protection against excessive requests, which could lead to:
- Denial of Service (DoS) attacks
- Resource exhaustion
- Unfair usage patterns affecting other users
- Database connection pool exhaustion

## Functional Requirements

1. **Global Rate Limits**: Apply default rate limits to all API endpoints
2. **Endpoint-Specific Limits**: Allow different limits for critical endpoints (auth, data)
3. **WebSocket Protection**: Rate limit WebSocket message handling
4. **Configurable Limits**: Support environment-based configuration
5. **Clear Error Responses**: Return 429 status with retry-after headers

## Non-Functional Requirements

1. **Performance**: Rate limiting must add < 5ms latency per request
2. **Storage**: Use Redis or in-memory storage (configurable)
3. **Flexibility**: Support different strategies (fixed window, sliding window, token bucket)
4. **Monitoring**: Log rate limit events for security analysis

## Technical Design

### Approach

Use `slowapi` library (already in requirements.txt) with In-Memory storage for single-instance deployments and Redis for multi-instance setups.

### Rate Limit Strategy

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 1 minute |
| Authentication | 5 attempts | 5 minutes |
| WebSocket | 60 messages | 1 minute |
| Data Export | 10 requests | 1 minute |

### Implementation Details

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

## Success Criteria

1. All API endpoints return 429 after exceeding limits
2. Rate limit headers included in responses (X-RateLimit-Limit, X-RateLimit-Remaining)
3. WebSocket connections are rate limited on message frequency
4. Authentication endpoints have stricter limits
5. No performance degradation > 5ms per request

## Out of Scope

- Distributed rate limiting across multiple instances (Phase 2)
- User-based rate limiting (requires authentication)
- Geographic rate limiting
