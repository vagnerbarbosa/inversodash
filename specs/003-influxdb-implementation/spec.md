# InfluxDB Implementation

## Summary

Implement InfluxDB time-series database for efficient storage and querying of inverter data with proper retention policies and downsampling.

## Motivation

Current in-memory storage is volatile and doesn't support:
- Historical data analysis
- Data persistence across restarts
- Efficient time-range queries
- Data aggregation for long-term trends
- Scalable data volume handling

## Functional Requirements

1. **Time-Series Storage**: Store inverter metrics with timestamps
2. **Retention Policies**: Automatic data tiering (raw, hourly, daily aggregates)
3. **Downsampling**: Continuous queries for data aggregation
4. **Query API**: Fast retrieval of historical data with time ranges
5. **Backup Support**: Export/import capabilities

## Non-Functional Requirements

1. **Performance**: Queries return in < 100ms for 24h of data
2. **Storage Efficiency**: Downsampling reduces storage by 90% after 7 days
3. **High Availability**: Support for InfluxDB clustering (future)
4. **Data Integrity**: No data loss during writes

## Technical Design

### Schema Design

```
Bucket: inversor_data

Measurements:
- inverter_metrics (power, voltage, current, energy, temperature, frequency)
  - tags: inverter_id, phase
  - fields: active_power, voltage_l1, voltage_l2, current_l1, daily_energy, etc.
```

### Retention Policy

| Policy | Duration | Resolution | Purpose |
|--------|----------|------------|---------|
| autogen (default) | 7 days | 5 seconds | Real-time monitoring |
| downsampled_1h | 30 days | 1 hour | Historical analysis |
| downsampled_1d | 1 year | 1 day | Long-term trends |

### Implementation Details

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Write data
point = Point("inverter_metrics") \
    .tag("inverter_id", "SUN2000") \
    .field("active_power", 4500.5) \
    .field("voltage_l1", 220.3) \
    .time(datetime.utcnow())

write_api.write(bucket="inversor_data", record=point)
```

## Success Criteria

1. All inverter data persisted to InfluxDB with timestamps
2. 7-day retention policy for raw data active
3. Continuous queries aggregate data to hourly/daily
4. API endpoints query InfluxDB for historical data
5. Grafana-compatible data structure for future visualization

## Out of Scope

- InfluxDB clustering/high availability setup
- Custom Grafana dashboard creation
- Machine learning on time-series data
