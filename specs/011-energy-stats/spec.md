# Energy Statistics by Period

## Summary

Add energy generation statistics grouped by time periods (daily, weekly, monthly, yearly) to provide users with comprehensive production insights and historical comparisons.

## Motivation

Currently, the dashboard only shows instantaneous and daily energy values. Users cannot track:
- Total energy generated this week vs last week
- Monthly production trends
- Year-over-year comparisons
- Peak generation periods

## Functional Requirements

1. **Daily Statistics**: Energy generated today, yesterday, and daily average
2. **Weekly Statistics**: Current week total, last week total, weekly average
3. **Monthly Statistics**: Current month, last month, monthly trend
4. **Yearly Statistics**: Current year, last year, yearly comparison
5. **Peak Values**: Record peak power and energy days

## Non-Functional Requirements

1. **Performance**: Statistics calculation < 100ms
2. **Accuracy**: Use InfluxDB aggregations for precision
3. **Update Frequency**: Calculate on-demand with caching
4. **Storage**: Persist aggregated data in InfluxDB

## Technical Design

### API Endpoints

```python
GET /api/stats/energy?period={day|week|month|year}

Response:
{
  "period": "month",
  "current": 450.5,      // kWh generated this month
  "previous": 380.2,     // kWh last month
  "average": 420.0,      // Monthly average
  "change_percent": 18.5, // % change vs previous
  "peak_day": {
    "date": "2026-06-15",
    "energy": 28.5
  }
}
```

### Data Aggregation Strategy

| Period | Aggregation | Retention |
|--------|-------------|-----------|
| Daily | Sum of 5-min readings | 30 days raw |
| Weekly | Sum of daily | 52 weeks |
| Monthly | Sum of daily | 24 months |
| Yearly | Sum of monthly | Permanent |

### InfluxDB Queries

```flux
from(bucket: "inversor_data")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "inverter_metrics")
  |> filter(fn: (r) => r._field == "daily_energy")
  |> aggregateWindow(every: 1d, fn: max)
  |> sum()
```

## Success Criteria

1. All endpoints return accurate energy totals per period
2. Frontend displays statistics cards for each period
3. Comparisons show percentage change with visual indicators
4. Peak generation days are identified
5. Data updates within 1 second of request

## Out of Scope

- Predictive generation forecasting
- Cost/savings calculations
- Export to PDF/CSV (separate feature)
