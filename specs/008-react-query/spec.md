# React Query Migration

## Summary

Migrate frontend data fetching from manual useEffect/useState to React Query (TanStack Query) for improved caching, background refetching, and error handling.

## Motivation

Current data fetching using useEffect has limitations:
- No built-in caching mechanism
- Manual error and loading state management
- No automatic background updates
- Stale-while-revalidate pattern not implemented
- Duplicate request handling not optimized

## Functional Requirements

1. **Query Hooks**: Replace useEffect data fetching with useQuery
2. **Mutation Hooks**: Use useMutation for data modifications
3. **Caching**: Automatic caching with configurable stale time
4. **Background Updates**: Refetch on window focus, network reconnect
5. **Error Handling**: Centralized error handling with retries
6. **Optimistic Updates**: Update UI before API confirmation

## Non-Functional Requirements

1. **Performance**: Reduce duplicate network requests by 50%+
2. **UX**: Stale data immediately available while fetching fresh
3. **Maintainability**: Centralized query configuration
4. **Type Safety**: Full TypeScript support (if migrating to TS)

## Technical Design

### Query Structure

```jsx
// Query hook pattern
const useInverterData = () => {
  return useQuery({
    queryKey: ['inverter', 'data'],
    queryFn: fetchInverterData,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 10000,
    retry: 3,
  });
};

// Mutation pattern
const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });
};
```

### Query Key Strategy

| Data Type | Query Key | Refetch Strategy |
|-----------|-----------|------------------|
| Real-time inverter | ['inverter', 'data'] | Poll 5s, stale 10s |
| Historical data | ['historical', {dateRange}] | On demand |
| Configuration | ['config'] | Invalidate on change |
| Health status | ['health'] | Poll 30s |

## Success Criteria

1. All API calls use React Query hooks
2. Real-time data polling uses useQuery with refetchInterval
3. Historical data queries cache results
4. Mutations invalidate related queries
5. Loading states handled by query status
6. Error states centralized

## Out of Scope

- Server-side rendering (SSR) with React Query
- Persist query cache to localStorage
- Infinite scroll pagination
