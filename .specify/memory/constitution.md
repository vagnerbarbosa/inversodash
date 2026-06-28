# InversoDash Constitution

## Project Principles

### 1. Security-First
- All endpoints must have authentication/authorization where appropriate
- Input validation is mandatory for all user inputs
- No hardcoded credentials; use environment variables
- Run containers as non-root users
- Implement rate limiting to prevent abuse

### 2. Performance-Optimized
- Use async/await for I/O operations
- Implement caching where beneficial
- Minimize bundle size in frontend
- Optimize database queries
- Use WebSocket for real-time updates efficiently

### 3. Production-Ready
- Comprehensive health checks
- Graceful error handling
- Structured logging
- Observable (metrics, traces, logs)
- Automated testing

### 4. Maintainable
- Clear separation of concerns
- Type hints throughout (Python)
- Functional components with hooks (React)
- Comprehensive documentation
- Follow 12-Factor App methodology

### 5. User-Centric
- Mobile-first responsive design
- Real-time updates with visual feedback
- Clear error messages
- Accessible (WCAG compliant)
- Fast loading times

## Technical Standards

### Backend (FastAPI)
- Python 3.11+
- Async endpoints
- Pydantic validation
- Dependency injection
- WebSocket for real-time data

### Frontend (React)
- React 18+
- Functional components only
- Custom hooks for reusable logic
- Tailwind CSS for styling
- Recharts for visualizations

### Infrastructure
- Docker multi-stage builds
- Docker Compose orchestration
- Non-root container execution
- Health checks on all services
- HTTPS in production

## Quality Gates

- [ ] All inputs validated
- [ ] Error handling implemented
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security scan passed
- [ ] Performance benchmarks met
