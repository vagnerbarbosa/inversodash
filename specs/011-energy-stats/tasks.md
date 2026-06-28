# Energy Statistics Tasks

## Backend

- [ ] **TASK-001**: Create InfluxDB energy aggregation queries
  - Query for daily energy sum
  - Query for weekly aggregation
  - Query for monthly aggregation
  - Query for yearly aggregation
  - Size: Medium
  - Dependencies: None

- [ ] **TASK-002**: Create `/api/stats/energy` endpoint
  - Accept period parameter (day/week/month/year)
  - Query InfluxDB for requested period
  - Return JSON with current/previous/average values
  - Size: Medium
  - Dependencies: TASK-001

- [ ] **TASK-003**: Implement peak detection
  - Query for peak energy day in period
  - Find maximum power output record
  - Add to API response
  - Size: Small
  - Dependencies: TASK-002

- [ ] **TASK-004**: Add caching layer
  - Cache results for 5 minutes
  - Invalidate on new data
  - Reduce InfluxDB queries
  - Size: Small
  - Dependencies: TASK-002

## Frontend

- [ ] **TASK-005**: Create EnergyStatsCard component
  - Display period title (Hoje, Esta Semana, etc)
  - Show energy value in kWh
  - Add trend indicator (up/down arrow)
  - Show percentage change
  - Size: Medium
  - Dependencies: None

- [ ] **TASK-006**: Create energy stats hook
  - useEnergyStats hook with period parameter
  - Fetch from API on mount
  - Auto-refresh every 5 minutes
  - Size: Small
  - Dependencies: TASK-002

- [ ] **TASK-007**: Add stats grid to dashboard
  - Create 4-column grid for period cards
  - Day, Week, Month, Year cards
  - Responsive layout
  - Size: Small
  - Dependencies: TASK-005, TASK-006

- [ ] **TASK-008**: Add peak indicator to cards
  - Show peak day with date
  - Highlight record values
  - Optional: sparkline chart
  - Size: Small
  - Dependencies: TASK-003, TASK-005

## Testing

- [ ] **TASK-009**: Verify data accuracy
  - Compare API results with raw data
  - Test different time periods
  - Validate calculations
  - Size: Medium
  - Dependencies: TASK-002

- [ ] **TASK-010**: Test edge cases
  - No data available
  - Partial day/week
  - Year boundary
  - Size: Small
  - Dependencies: TASK-009

## Documentation

- [ ] **TASK-011**: Update API documentation
  - Document `/api/stats/energy` endpoint
  - Add response examples
  - Update CLAUDE.md
  - Size: Small
  - Dependencies: All above
