# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within InversoDash, please follow these steps:

### 1. Do Not Open a Public Issue

Security vulnerabilities should **never** be reported through public GitHub issues. This helps protect users while we develop and release a fix.

### 2. Report via Email

Send a detailed report to **security@inversodash.local** with:

- **Subject**: `[SECURITY] Brief description of the vulnerability`
- **Description**: Detailed explanation of the vulnerability
- **Steps to Reproduce**: Clear instructions to reproduce the issue
- **Impact**: Potential security impact and affected components
- **Suggested Fix**: If you have suggestions for remediation

### 3. Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Patch Development | Based on severity |
| Public Disclosure | After patch release |

### 4. Security Best Practices

When deploying InversoDash:

#### Network Security
- Always use HTTPS in production
- Restrict access to Modbus TCP port (502) to trusted networks only
- Use firewall rules to limit API access
- Enable rate limiting to prevent abuse

#### Authentication
- Change default credentials immediately
- Use strong passwords (minimum 12 characters)
- Enable JWT authentication
- Rotate secrets regularly

#### Container Security
- Containers run as non-root users
- Read-only filesystem where possible
- No new privileges enabled
- Minimal capabilities granted

#### Data Protection
- InfluxDB requires authentication
- WebSocket connections should use WSS
- Sensitive data never logged
- Credentials never committed to repository

### 5. Security Features

InversoDash implements the following security measures:

- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Pydantic v2 validation on all inputs
- **CORS Protection**: Configurable cross-origin restrictions
- **JWT Authentication**: Stateless authentication with refresh tokens
- **HTTPS Only**: Secure communication enforced
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Non-Root Containers**: Containers run with minimal privileges

### 6. Security Scanning

Regular security audits are performed using:

- Dependency vulnerability scanning (Dependabot)
- Container image scanning (Trivy/Snyk)
- Static code analysis (CodeQL)
- Secret scanning (GitHub Secret Scanning)

### 7. Disclosure Policy

We follow a **responsible disclosure** policy:

1. Reporter privately discloses vulnerability
2. We confirm receipt and begin investigation
3. We develop and test a fix
4. Fix is released in a new version
5. Public disclosure after 30 days or sooner if already public

## Security Contacts

| Role | Contact |
|------|---------|
| Security Team | security@inversodash.local |
| Maintainer | maintainer@inversodash.local |

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities to help keep InversoDash and its users safe.

---

*Last updated: 2026-06-28*
