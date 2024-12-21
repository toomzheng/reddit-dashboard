'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication';
  if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  } else if (error === 'AccessDenied') {
    errorMessage = 'You do not have permission to sign in.';
  } else if (error === 'Verification') {
    errorMessage = 'The sign in link is no longer valid.';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            className="w-full"
            asChild
          >
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 