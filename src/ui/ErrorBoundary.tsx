import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Contains a failure to one laboratory section so navigation keeps working. Give it a `key` per route to reset. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Section failed to render', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink-100">This section stopped working</h1>
        <p className="mt-2 text-sm text-ink-400">Your saved progress is safe. Choose another section from the navigation or reload the page.</p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-chassis-700 bg-chassis-950 p-3 text-left text-xs text-danger-400">{this.state.error.message}</pre>
      </div>
    )
  }
}
