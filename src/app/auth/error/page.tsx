'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please check if all environment variables are properly set.';
      case 'AccessDenied':
        return 'Access denied. You may not have permission to access this resource.';
      case 'OAuthSignin':
        return 'Error occurred during OAuth sign-in. Please try again or use a different sign-in method.';
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create email provider account. Please try again.';
      case 'Callback':
        return 'Error occurred during the callback. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error ? getErrorMessage(error) : 'An error occurred during authentication.'}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
} 