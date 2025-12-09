'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Doğrulama işlemi yapılıyor...');

  const supabase = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      // Get all possible parameters
      const tokenHash = searchParams.get('token_hash');
      const code = searchParams.get('code');
      const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | 'magiclink' | null;
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Auth confirm params:', { tokenHash: !!tokenHash, code: !!code, type, error });

      // Handle error from Supabase
      if (error) {
        setStatus('error');
        setMessage(errorDescription || error);
        toast.error('Doğrulama Hatası', { description: errorDescription || error });
        return;
      }

      try {
        let session = null;

        // Method 1: Token Hash (OTP flow - works across browsers)
        if (tokenHash && type) {
          console.log('Using OTP token_hash flow');
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'recovery' | 'signup' | 'email' | 'magiclink',
          });

          if (verifyError) throw verifyError;
          session = data.session;
        }
        // Method 2: Authorization Code (PKCE flow - same browser only)
        else if (code) {
          console.log('Using PKCE code flow');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            // PKCE failed - likely different browser
            if (exchangeError.message.includes('code_verifier') || 
                exchangeError.message.includes('invalid') ||
                exchangeError.message.includes('expired')) {
              throw new Error('Bu bağlantı farklı bir tarayıcıda açıldı veya süresi doldu. Lütfen şifre sıfırlama işlemini başlattığınız tarayıcıda açın veya yeni bir istek gönderin.');
            }
            throw exchangeError;
          }
          session = data.session;
        }
        // No valid parameters
        else {
          throw new Error('Doğrulama parametreleri bulunamadı.');
        }

        if (session) {
          setStatus('success');

          // Handle different auth types
          if (type === 'recovery') {
            setMessage('Şifre sıfırlama doğrulandı. Yönlendiriliyorsunuz...');
            toast.success('Doğrulama Başarılı', { description: 'Şifre belirleme sayfasına yönlendiriliyorsunuz.' });
            setTimeout(() => router.push('/auth/reset-password'), 1500);
          } else if (type === 'signup' || type === 'email') {
            setMessage('E-posta doğrulandı. Ana sayfaya yönlendiriliyorsunuz...');
            toast.success('Hoş Geldiniz!', { description: 'E-posta adresiniz başarıyla doğrulandı.' });
            setTimeout(() => router.push('/'), 1500);
          } else {
            setMessage('Giriş başarılı. Yönlendiriliyorsunuz...');
            toast.success('Giriş Başarılı');
            setTimeout(() => router.push('/'), 1500);
          }
        } else {
          throw new Error('Oturum oluşturulamadı.');
        }
      } catch (err: any) {
        console.error('Auth verification error:', err);
        setStatus('error');
        setMessage(err.message || 'Doğrulama sırasında bir hata oluştu.');
        toast.error('Doğrulama Hatası', { description: err.message });
      }
    };

    handleAuth();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Doğrulanıyor
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Başarılı!
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Doğrulama Hatası
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 rounded-lg bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-orange-600"
            >
              Ana Sayfaya Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
