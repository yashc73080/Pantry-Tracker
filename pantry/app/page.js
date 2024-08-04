'use client';

import { ErrorBoundary } from 'react-error-boundary';
import PantryClient from './PantryClient';

function ErrorFallback({error}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PantryClient />
    </ErrorBoundary>
  );
}