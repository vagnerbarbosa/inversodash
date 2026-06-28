# Input Validation

## Summary

Implement comprehensive input validation using Pydantic v2 to ensure data integrity, prevent injection attacks, and provide clear validation error messages.

## Motivation

Currently, API endpoints lack consistent input validation:
- No type checking on request data
- Potential for injection attacks
- Unclear error messages for invalid input
- Manual validation scattered throughout code

## Functional Requirements

1. **Request Models**: Pydantic v2 models for all API inputs
2. **Response Models**: Consistent output serialization
3. **Field Validation**: Type checking, ranges, patterns
4. **Custom Validators**: Business logic validation
5. **Error Messages**: Clear, user-friendly validation errors

## Non-Functional Requirements

1. **Performance**: Validation overhead < 1ms
2. **Security**: Prevent injection and overflow attacks
3. **Developer Experience**: Clear schema documentation
4. **Compatibility**: Full Pydantic v2 feature usage

## Technical Design

### Request Model Example

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class InverterDataQuery(BaseModel):
    start_date: datetime
    end_date: datetime
    metrics: list[str] = Field(default=["power", "voltage"])
    aggregate: Optional[str] = Field(default=None, pattern="^(mean|max|min|sum)$")
    
    @field_validator("end_date")
    def end_after_start(cls, v, info):
        if v < info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v
```

### Validation Coverage

| Endpoint Category | Validation Requirements |
|-------------------|------------------------|
| Historical Data | Date ranges, metric names, aggregation functions |
| Configuration | IP addresses, port numbers, intervals |
| Auth | Username format, password strength, token format |
| WebSocket | Message size limits, command validation |

## Success Criteria

1. All API endpoints use Pydantic models for request/response
2. Validation errors return 422 with detailed messages
3. Custom validators for business logic
4. Swagger docs show all schemas
5. No manual validation remaining

## Out of Scope

- GraphQL schema validation
- Database-level constraints
- Frontend form validation (separate concern)
