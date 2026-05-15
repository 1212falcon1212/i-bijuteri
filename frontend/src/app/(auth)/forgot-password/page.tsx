'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await authApi.forgotPassword(email);

    if (response.data) {
      setIsSuccess(true);
      toast.success('Bağlantı gönderildi!', {
        description: 'E-posta adresinizi kontrol edin.',
        position: 'bottom-right',
      });
    } else {
      const errorMessage = response.error || 'Bir hata oluştu. Lütfen tekrar deneyin.';
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
      {/* Header */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-black text-charcoal tracking-tight">Şifremi Unuttum</h1>
        <p className="text-sm text-charcoal-light mt-1">
          Şifrenizi sıfırlamak için e-posta adresinizi girin
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <div className="flex flex-col items-center gap-4 p-6 bg-primary-light/40 border border-primary-border rounded-2xl text-center">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-primary-dark mb-1">Bağlantı Gönderildi</h3>
                <p className="text-sm text-charcoal-mid">
                  E-posta adresinize şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Error Message */}
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
              <Label htmlFor="email" className="text-sm font-semibold text-charcoal">
                E-posta Adresi
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 pr-4 bg-white border-card-border rounded-xl focus:border-primary-mid focus:ring-2 focus:ring-primary/15"
                />
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
                  Gönderiliyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sıfırlama Bağlantısı Gönder
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
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
