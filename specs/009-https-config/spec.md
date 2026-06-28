# HTTPS Configuration

## Summary

Implement HTTPS for secure communication between clients and the server, including certificate management and HSTS headers.

## Motivation

Currently, the application runs over HTTP which presents security risks:
- Credentials transmitted in plaintext
- Data vulnerable to interception
- No protection against man-in-the-middle attacks
- Required for PWA installation
- Security scanners flag as critical

## Functional Requirements

1. **TLS Termination**: HTTPS on port 443
2. **Certificate Management**: Automated certificate acquisition and renewal
3. **HSTS Headers**: HTTP Strict Transport Security
4. **Secure Cookies**: HttpOnly, Secure, SameSite flags
5. **Redirect**: HTTP to HTTPS redirection

## Non-Functional Requirements

1. **Security**: TLS 1.2+ only, strong cipher suites
2. **Performance**: Minimal latency overhead
3. **Reliability**: Automatic certificate renewal
4. **Compatibility**: Works with reverse proxies

## Technical Design

### Certificate Options

| Option | Use Case | Implementation |
|--------|----------|----------------|
| Let's Encrypt | Production, public domain | certbot or acme.sh |
| Self-signed | Development, internal | openssl |
| Custom CA | Enterprise internal | vault or file-based |

### Nginx HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name inversor.local;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### Docker Compose Updates

```yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - certbot-data:/etc/letsencrypt
```

## Success Criteria

1. HTTPS accessible on port 443
2. HTTP redirects to HTTPS
3. Valid SSL certificate (not self-signed warning for prod)
4. HSTS headers present in responses
5. Secure cookie flags set
6. TLS 1.2+ only (no SSLv3, TLS 1.0/1.1)

## Out of Scope

- Client certificate authentication (mTLS)
- Certificate pinning
- OCSP stapling
