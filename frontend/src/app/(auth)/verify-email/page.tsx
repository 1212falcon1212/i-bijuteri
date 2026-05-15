'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

type VerificationStatus = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const hash = searchParams.get('hash') || '';
  const expires = searchParams.get('expires') || '';
  const signature = searchParams.get('signature') || '';

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useCallback(async () => {
    if (!id || !hash || !expires || !signature) {
      setStatus('error');
      setErrorMessage('Geçersiz doğrulama bağlantısı. Gerekli parametreler eksik.');
      return;
    }
    setStatus('loading');
    const response = await authApi.verifyEmail({ id, hash, expires, signature });
    if (response.data) {
      setStatus('success');
      toast.success('E-posta doğrulandı!', { position: 'bottom-right' });
    } else {
      setStatus('error');
      setErrorMessage(
        response.error || 'Doğrulama başarısız. Bağlantı geçersiz veya süresi dolmuş olabilir.'
      );
    }
  }, [id, hash, expires, signature]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  const handleResend = async () => {
    setIsResending(true);
    const response = await authApi.resendVerification();
    if (response.data) {
      toast.success('Doğrulama e-postası gönderildi!', {
        description: 'Lütfen gelen kutunuzu kontrol edin.',
        position: 'bottom-right',
      });
    } else {
      toast.error('Gönderim başarısız', {
        description: response.error || 'Lütfen daha sonra tekrar deneyin.',
      });
    }
    setIsResending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="mb-7 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-charcoal tracking-tight">E-posta Doğrulama</h1>
        <p className="text-sm text-charcoal-light mt-1">E-posta adresinizi doğruluyoruz</p>
      </div>

      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="text-base font-semibold text-charcoal">E-posta doğrulanıyor...</p>
          <p className="text-sm text-charcoal-light">Lütfen bekleyin</p>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center gap-3 p-6 bg-primary-light/40 border border-primary-border rounded-2xl text-center">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-primary-dark mb-1">
                E-posta Adresiniz Doğrulandı!
              </h3>
              <p className="text-sm text-charcoal-mid">
                Hesabınız başarıyla doğrulandı. Artık i-Bijuteri&apos;ye giriş yapabilirsiniz.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button className="h-12 px-8 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition-colors duration-150">
                <span className="flex items-center gap-2">
                  Giriş Yap
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center gap-3 p-6 bg-danger-light border border-danger/20 rounded-2xl text-center">
            <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-danger" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-danger mb-1">Doğrulama Başarısız</h3>
              <p className="text-sm text-charcoal-mid">{errorMessage}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleResend}
              disabled={isResending}
              className="h-12 px-8 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition-colors duration-150"
            >
              <span className="flex items-center gap-2">
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Tekrar Gönder
                  </>
                )}
              </span>
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-charcoal-mid hover:text-charcoal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
