'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.input<typeof loginSchema>;

function LoginForm() {
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'buyer' | 'supplier'>('buyer');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const getRedirectUrl = (): string => {
    const redirect = searchParams.get('redirect');
    if (redirect && redirect.startsWith('/')) return redirect;
    return '/market';
  };

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError('');
    setIsLoading(true);

    const revokeOthers = !data.rememberMe;
    const result = await login(data.email, data.password, revokeOthers);
    if (result.success) {
      toast.success('Giriş başarılı!', {
        description: 'Yönlendiriliyorsunuz...',
        position: 'bottom-right',
      });
      router.push(getRedirectUrl());
    } else {
      const raw = result.error || '';
      let msg = raw || 'Geçersiz e-posta veya şifre.';
      if (/verif|doğrula|verify/i.test(raw)) {
        msg = 'Hesabınız henüz doğrulanmamış.';
      } else if (/credential|invalid|geçers/i.test(raw)) {
        msg = 'Geçersiz e-posta veya şifre.';
      }
      setSubmitError(msg);
      toast.error('Giriş başarısız', { description: msg });
    }
    setIsLoading(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <span className="eyebrow inline-flex items-center gap-3 mb-4 text-[var(--accent-2)]">
        <span className="gold-rule" /> Üye Girişi
      </span>
      <h1 className="font-display italic text-[44px] text-[var(--ink)] mb-3 leading-[1.05] -tracking-[.01em]">
        Tekrar hoş geldiniz.
      </h1>
      <p className="text-[14.5px] text-[var(--ink-2)] mb-10 leading-[1.6]">
        i-bijuteri pazaryerine giriş yapın ve tedarik sürecinize devam edin.
      </p>

      <div className="login-seg">
        <button
          type="button"
          onClick={() => setAccountType('buyer')}
          className={accountType === 'buyer' ? 'active' : ''}
        >
          Alıcı
        </button>
        <button
          type="button"
          onClick={() => setAccountType('supplier')}
          className={accountType === 'supplier' ? 'active' : ''}
        >
          Tedarikçi
        </button>
      </div>

      {submitError && (
        <div className="mb-5 flex items-center gap-3 p-3.5 bg-[rgba(178,58,72,0.08)] border-l-2 border-[var(--danger)] text-[var(--danger)] text-[13px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="login-fields" noValidate>
        {/* Email */}
        <div className="field">
          <label htmlFor="email">E-Posta veya Müşteri Kodu</label>
          <div className="wrap">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@firma.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && <p className="err">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="field">
          <label htmlFor="password">Şifre</label>
          <div className="wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="err">{errors.password.message}</p>}

          <div className="help-row">
            <label className="remember">
              <input type="checkbox" {...register('rememberMe')} /> Beni hatırla
            </label>
            <Link href="/forgot-password" className="forgot">
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="login-submit">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Giriş Yapılıyor…
            </>
          ) : (
            'Giriş Yap'
          )}
        </button>
      </form>

      <p className="login-foot">
        Henüz hesabınız yok mu?{' '}
        <Link href="/register">Kuyumcu kaydı oluşturun →</Link>
        <span className="kvkk">
          Devam ederek <Link href="/sayfa/kvkk">KVKK Aydınlatma Metni</Link>&apos;ni ve{' '}
          <Link href="/sayfa/kullanim-kosullari">Kullanım Koşulları</Link>&apos;nı kabul ediyorum.
        </span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
