# HTTPS Configuration Tasks

## Certificate Setup

- [ ] **TASK-001**: Create certificate generation script for development
  - Create `scripts/generate-dev-certs.sh`
  - Generate RSA 2048-bit key
  - Generate self-signed certificate for localhost, 127.0.0.1, ::1
  - Set 365-day validity
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Generate development certificates
  - Run the generation script
  - Output to `docker/ssl/` directory
  - Add to .gitignore
  - Size: Small
  - Dependencies: TASK-001

## Nginx Configuration

- [ ] **TASK-003**: Update nginx.conf for HTTPS
  - Add SSL server block on 443
  - Configure ssl_certificate paths
  - Set ssl_protocols (TLSv1.2 TLSv1.3)
  - Set ssl_ciphers
  - Size: Medium
  - Dependencies: TASK-002

- [ ] **TASK-004**: Add HTTP to HTTPS redirect
  - Configure port 80 server block
  - Add 301 redirect to https://$host$request_uri
  - Size: Small
  - Dependencies: TASK-003

- [ ] **TASK-005**: Add security headers
  - Add HSTS header with max-age=31536000
  - Add X-Frame-Options SAMEORIGIN
  - Add X-Content-Type-Options nosniff
  - Add X-XSS-Protection
  - Size: Small
  - Dependencies: TASK-003

## Docker Configuration

- [ ] **TASK-006**: Update docker-compose for HTTPS
  - Expose port 443 in nginx service
  - Mount SSL certificates volume
  - Size: Small
  - Dependencies: TASK-002

## Application Updates

- [ ] **TASK-007**: Update FastAPI for HTTPS
  - Configure secure cookie flags in responses
  - Set Secure, HttpOnly, SameSite=Strict for auth cookies
  - Update CORS to allow https:// origins
  - Size: Small
  - Dependencies: None

- [ ] **TASK-008**: Update WebSocket for secure connections
  - Use wss:// protocol when available
  - Update connection logic for HTTPS environments
  - Size: Small
  - Dependencies: TASK-007

- [ ] **TASK-009**: Update frontend API client
  - Use https:// protocol for API calls
  - Handle mixed content warnings
  - Size: Small
  - Dependencies: None

## Testing

- [ ] **TASK-010**: Test SSL configuration
  - Run `openssl s_client -connect localhost:443`
  - Verify certificate chain
  - Check supported TLS versions
  - Size: Small
  - Dependencies: TASK-003, TASK-006

- [ ] **TASK-011**: Verify HTTP redirect
  - Test http:// redirects to https://
  - Preserve path and query parameters
  - Size: Small
  - Dependencies: TASK-004

- [ ] **TASK-012**: Test application functionality
  - Verify all API calls work over HTTPS
  - Verify WebSocket wss:// connection
  - Verify no mixed content warnings
  - Size: Medium
  - Dependencies: TASK-007, TASK-008, TASK-009

## Production Certificate Plan

- [ ] **TASK-013**: Document Let's Encrypt setup
  - Create certbot docker-compose configuration
  - Document certificate renewal process
  - Add production domain configuration
  - Size: Small
  - Dependencies: None

## Documentation

- [ ] **TASK-014**: Update deployment documentation
  - Document HTTPS setup process
  - Include certificate renewal instructions
  - Add troubleshooting for SSL issues
  - Size: Small
  - Dependencies: All above
