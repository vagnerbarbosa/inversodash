# React Query Tasks

## Setup

- [ ] **TASK-001**: Install React Query dependencies
  - Run: `npm install @tanstack/react-query`
  - Add devtools: `npm install -D @tanstack/react-query-devtools`
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Configure QueryClient
  - Create `frontend/src/lib/queryClient.js`
  - Configure default options (staleTime, retry, refetchOnWindowFocus)
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-003**: Wrap app with QueryClientProvider
  - Update `frontend/src/main.jsx`
  - Add QueryClientProvider
  - Add ReactQueryDevtools in development mode
  - Size: Small
  - Dependencies: TASK-002

## Query Hooks

- [ ] **TASK-004**: Create useInverterData hook
  - Create `frontend/src/hooks/useInverterData.js`
  - Use useQuery with refetchInterval: 5000
  - Return data, isLoading, error, refetch
  - Size: Medium
  - Dependencies: TASK-003

- [ ] **TASK-005**: Create useHistoricalData hook
  - Create `frontend/src/hooks/useHistoricalData.js`
  - Accept dateRange parameters
  - Configure staleTime: 5 minutes
  - Size: Medium
  - Dependencies: TASK-003

- [ ] **TASK-006**: Create useHealthStatus hook
  - Create `frontend/src/hooks/useHealthStatus.js`
  - Poll every 30 seconds
  - Return status for health indicator
  - Size: Small
  - Dependencies: TASK-003

- [ ] **TASK-007**: Create useConfig hook
  - Create `frontend/src/hooks/useConfig.js`
  - Fetch configuration data
  - Size: Small
  - Dependencies: TASK-003

## Component Migration

- [ ] **TASK-008**: Update Dashboard to use useInverterData
  - Replace useEffect + useState
  - Use isLoading for loading state
  - Use error for error handling
  - Size: Medium
  - Dependencies: TASK-004

- [ ] **TASK-009**: Update RealTimeChart to use React Query
  - Replace polling useEffect
  - Use refetchInterval from query
  - Handle isLoading state
  - Size: Medium
  - Dependencies: TASK-004

- [ ] **TASK-010**: Update historical data components
  - Replace manual fetching
  - Use useHistoricalData hook
  - Handle date range changes
  - Size: Medium
  - Dependencies: TASK-005

## Mutations

- [ ] **TASK-011**: Create useUpdateConfig mutation
  - Create `frontend/src/hooks/useUpdateConfig.js`
  - Use useMutation
  - Invalidate config query on success
  - Size: Medium
  - Dependencies: TASK-003

- [ ] **TASK-012**: Create useLogin mutation
  - Use useMutation for login POST
  - On success: store token, invalidate user query
  - Size: Small
  - Dependencies: TASK-003

- [ ] **TASK-013**: Create useLogout mutation
  - Clear token and user data
  - Clear query cache on logout
  - Size: Small
  - Dependencies: TASK-003

## Error Handling

- [ ] **TASK-014**: Implement centralized error handling
  - Configure onError in QueryClient defaultOptions
  - Show toast notifications on errors
  - Size: Small
  - Dependencies: TASK-003

## Testing

- [ ] **TASK-015**: Test query behavior
  - Verify caching works
  - Verify background refetching
  - Test error retry behavior
  - Size: Medium
  - Dependencies: TASK-008, TASK-009, TASK-010

## Documentation

- [ ] **TASK-016**: Document React Query usage
  - Document query key conventions
  - Add hook usage examples
  - Document cache invalidation strategy
  - Size: Small
  - Dependencies: All above
