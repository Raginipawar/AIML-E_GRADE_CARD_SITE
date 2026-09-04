import { Component } from 'react';

/** Catches render/effect errors from a risky child (e.g. a WebGL component
 * on a browser with no/broken GPU support) so the rest of the page still
 * renders instead of going blank. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
