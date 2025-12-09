import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') || '/';
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // If this is a password reset flow, force redirect to reset password page
  if (type === 'recovery') {
    next = '/auth/reset-password';
  }

  console.log('Callback route hit. Params:', {
    code: code ? 'Present' : 'Missing',
    type,
    error,
    error_description,
    next
  });

  if (error) {
    console.error('❌ Supabase returned error:', error, error_description);
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(error_description || error)}`,
        request.url
      )
    );
  }

  if (code) {
    const supabase = await createClient();

    try {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (!sessionError) {
        console.log('✅ Email verified successfully, redirecting to:', next);
        return NextResponse.redirect(new URL(next, request.url));
      } else {
        console.error('❌ Error exchanging code:', sessionError);
        return NextResponse.redirect(
          new URL(
            `/auth/error?message=${encodeURIComponent(sessionError.message)}`,
            request.url
          )
        );
      }
    } catch (err) {
      console.error('❌ Exception during code exchange:', err);
      return NextResponse.redirect(
        new URL(`/auth/error?message=Verification failed`, request.url)
      );
    }
  }

  // No code provided
  console.log('❌ No code provided in callback');
  return NextResponse.redirect(
    new URL(`/auth/error?message=No verification code provided. Please try signing in again.`, request.url)
  );
}
