# Input Validation Tasks

## Request Models

- [ ] **TASK-001**: Create base request models
  - Create `backend/schemas/requests.py`
  - Implement base pagination model
  - Implement date range base model
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Create historical data query model
  - `HistoricalDataQuery` with start_date, end_date
  - metrics: list[str] with allowed values
  - aggregate: Optional[Literal["mean", "max", "min", "sum"]]
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-003**: Create configuration models
  - `InverterConfig` with ip_address validation
  - `ModbusConfig` with port and interval validation
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-004**: Create auth request models
  - `LoginRequest` with username and password fields
  - `TokenRefreshRequest` with refresh_token
  - Size: Small
  - Dependencies: TASK-001

## Response Models

- [ ] **TASK-005**: Create base response models
  - Create `backend/schemas/responses.py`
  - Implement `ApiResponse[T]` generic wrapper
  - Implement `ErrorResponse` with details
  - Size: Small
  - Dependencies: None

- [ ] **TASK-006**: Create inverter data response model
  - `InverterDataResponse` with all metrics
  - Proper field types and descriptions
  - Size: Small
  - Dependencies: TASK-005

- [ ] **TASK-007**: Create health check response model
  - `HealthResponse` with status and checks
  - `CheckStatus` model for individual checks
  - Size: Small
  - Dependencies: TASK-005

## Custom Validators

- [ ] **TASK-008**: Implement date range validator
  - Validator to ensure end_date > start_date
  - Maximum range limit (e.g., 30 days)
  - Size: Small
  - Dependencies: TASK-002

- [ ] **TASK-009**: Implement IP address validator
  - Validate IPv4 format
  - Reject private IPs if needed
  - Size: Small
  - Dependencies: TASK-003

- [ ] **TASK-010**: Implement metric name validator
  - Validate metric names against allowed list
  - Allow wildcards for "all metrics"
  - Size: Small
  - Dependencies: TASK-002

## Endpoint Integration

- [ ] **TASK-011**: Update historical data endpoint
  - Apply `HistoricalDataQuery` model
  - Return `InverterDataResponse`
  - Size: Small
  - Dependencies: TASK-002, TASK-006

- [ ] **TASK-012**: Update config endpoints
  - Apply configuration request models
  - Add proper response models
  - Size: Small
  - Dependencies: TASK-003, TASK-009

- [ ] **TASK-013**: Update auth endpoints
  - Apply auth request models
  - Return typed token responses
  - Size: Small
  - Dependencies: TASK-004

- [ ] **TASK-014**: Update health endpoint
  - Return `HealthResponse` model
  - Size: Small
  - Dependencies: TASK-007

## Error Handling

- [ ] **TASK-015**: Customize validation error response
  - Override FastAPI validation exception handler
  - Format errors consistently
  - Include field names and messages
  - Size: Small
  - Dependencies: TASK-011 to TASK-014

## Testing

- [ ] **TASK-016**: Write validation tests
  - Test valid input acceptance
  - Test invalid input rejection with 422
  - Test custom validators
  - Size: Medium
  - Dependencies: TASK-011 to TASK-015

## Documentation

- [ ] **TASK-017**: Document schemas
  - Add descriptions to all Pydantic fields
  - Generate schema documentation
  - Add examples to models
  - Size: Small
  - Dependencies: All above
