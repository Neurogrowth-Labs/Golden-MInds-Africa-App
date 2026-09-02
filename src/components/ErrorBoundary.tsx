import { useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/** Logs uncaught browser errors without exposing implementation details to users. */
export default function ErrorBoundary({ children }: Props) {
  useEffect(() => {
    const reportError = (event: ErrorEvent) => {
      console.error('Uncaught client error', event.error ?? event.message);
    };
    const reportRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled client rejection', event.reason);
    };

    window.addEventListener('error', reportError);
    window.addEventListener('unhandledrejection', reportRejection);
    return () => {
      window.removeEventListener('error', reportError);
      window.removeEventListener('unhandledrejection', reportRejection);
    };
  }, []);

  return <>{children}</>;
}
