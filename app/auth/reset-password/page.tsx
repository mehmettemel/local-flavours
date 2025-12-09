'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const handleSession = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        // Exchange code for session (PKCE flow)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error('Bağlantı Hatası', {
            description: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.',
          });
          router.push('/');
        } else if (data.session) {
          setUser(data.session.user);
        }
      } else {
        // Check if we already have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Oturum bulunamadı', {
            description: 'Lütfen şifre sıfırlama bağlantısına tekrar tıklayın.',
          });
          router.push('/');
        } else {
          setUser(session.user);
        }
      }
    };

    handleSession();
  }, [router, supabase.auth, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Hata', {
        description: 'Şifreler eşleşmiyor.',
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Hata', {
        description: 'Şifre en az 6 karakter olmalıdır.',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) throw error;

      toast.success('Başarılı', {
        description: 'Şifreniz başarıyla güncellendi. Ana sayfaya yönlendiriliyorsunuz.',
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      toast.error('Hata', {
        description: error.message || 'Şifre güncellenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Yeni Şifre Belirle
          </CardTitle>
          <CardDescription>
            Lütfen hesabınız için yeni bir şifre belirleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="******"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="******"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Şifreyi Güncelle
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
