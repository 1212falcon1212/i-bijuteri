'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!token || !email) {
      setError('Geçersiz sıfırlama bağlantısı. Lütfen yeni bir bağlantı talep edin.');
      return;
    }

    setIsLoading(true);
    const response = await authApi.resetPassword({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });

    if (response.data) {
      api.setToken(response.data.token);
      toast.success('Şifre sıfırlandı!', {
        description: 'Yönlendiriliyorsunuz...',
        position: 'bottom-right',
      });
      router.push('/market');
    } else {
      const errorMessage =
        response.error || 'Şifre sıfırlama başarısız. Bağlantı geçersiz veya süresi dolmuş olabilir.';
      setError(errorMessage);
      toast.error('İşlem başarısız', { description: errorMessage });
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
      className="w-full"
    >
      <div className="mb-7 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-charcoal tracking-tight">Yeni Şifre Belirle</h1>
        <p className="text-sm text-charcoal-light mt-1">
          Hesabınız için güvenli bir şifre oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3.5 bg-danger-light border border-danger/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-charcoal">
            Yeni Şifre
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 pl-10 pr-12 bg-white border-card-border rounded-xl focus:border-primary-mid focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal-mid transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password_confirmation" className="text-sm font-semibold text-charcoal">
            Şifre Tekrar
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
            <Input
              id="password_confirmation"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Şifrenizi tekrar girin"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              className="h-12 pl-10 pr-12 bg-white border-card-border rounded-xl focus:border-primary-mid focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal-mid transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition-colors duration-150 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Şifre Sıfırlanıyor...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Şifreyi Sıfırla
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <div className="text-center pt-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-charcoal-mid hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Giriş sayfasına dön
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
