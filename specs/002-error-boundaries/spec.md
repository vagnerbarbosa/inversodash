# Error Boundaries

## Summary

Implement React Error Boundaries to gracefully handle JavaScript errors in the UI, preventing complete app crashes and providing user-friendly fallback experiences.

## Motivation

Currently, any unhandled JavaScript error in a component can crash the entire React application, resulting in:
- Complete white screen of death
- Loss of user data/state
- Poor user experience requiring page refresh
- No error reporting or diagnostics

## Functional Requirements

1. **Global Error Boundary**: Wrap entire application
2. **Component-Level Boundaries**: Isolate critical sections (charts, data tables)
3. **Fallback UI**: Display user-friendly error messages with recovery options
4. **Error Logging**: Log errors to console and/or backend
5. **Recovery Mechanism**: Allow users to retry or reset affected components

## Non-Functional Requirements

1. **UX**: Error UI should match application design system
2. **Performance**: Error boundaries must not impact render performance
3. **Accessibility**: Error messages must be screen reader accessible
4. **Debuggability**: Preserve error stack traces for development

## Technical Design

### Component Hierarchy

```
App
└── GlobalErrorBoundary
    ├── DashboardSection (ErrorBoundary)
    │   ├── ChartWidget
    │   └── StatsWidget
    ├── DataTableSection (ErrorBoundary)
    │   └── InverterDataTable
    └── SettingsSection
```

### Error Boundary Implementation

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Optional: Send to error tracking service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null };
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
```

## Success Criteria

1. Errors in child components don't crash parent or sibling components
2. User sees friendly error message instead of blank screen
3. Retry functionality resets component state
4. Error details logged to console
5. Error UI matches application design (dark theme)

## Out of Scope

- Error tracking service integration (Sentry, etc.)
- Automatic error recovery without user action
- Server-side error rendering
