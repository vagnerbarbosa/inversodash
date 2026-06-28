# Energy Statistics Implementation Plan

## Overview

Implement energy generation statistics by time period with InfluxDB aggregation.

## Phases

### Phase 1: Backend API (Day 1)

1. **InfluxDB Queries**
   - Create energy aggregation queries for each period
   - Implement caching layer for performance
   - Handle edge cases (no data, partial days)

2. **API Endpoints**
   - Create `/api/stats/energy` endpoint
   - Support period parameter (day, week, month, year)
   - Return current, previous, average, and peak values

### Phase 2: Frontend Components (Day 2)

1. **Statistics Cards**
   - Create EnergyStatsCard component
   - Show current period value with trend indicator
   - Display comparison vs previous period

2. **Dashboard Integration**
   - Add stats section to dashboard
   - Fetch data on component mount
   - Auto-refresh every 5 minutes

### Phase 3: Peak Detection (Day 3)

1. **Peak Values**
   - Query for peak generation day
   - Identify record power output
   - Display peak indicators

### Phase 4: Testing (Day 4)

1. **Data Validation**
   - Verify aggregations are accurate
   - Test with different time ranges
   - Validate edge cases

## Dependencies

- InfluxDB 2.x with Flux queries
- Existing data in InfluxDB
- Frontend chart library (already available)

## Risks

| Risk | Mitigation |
|------|------------|
| No historical data | Start aggregating from today, show N/A for past |
| Query performance | Use InfluxDB downsampling, add caching |
| Timezone issues | Use Brazil timezone consistently |

## Definition of Done

- [ ] All energy stats endpoints working
- [ ] Frontend displays day/week/month/year cards
- [ ] Peak generation day identified
- [ ] Trend indicators show increase/decrease
- [ ] Data accuracy validated
- [ ] Documentation updated
