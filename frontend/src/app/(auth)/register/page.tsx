'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Hash,
  ShieldCheck,
  Map,
} from 'lucide-react';
import { api, authApi, RegisterData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type FormState = {
  tax_number: string;
  business_name: string;
  nickname: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const initialFormState: FormState = {
  tax_number: '',
  business_name: '',
  nickname: '',
  phone: '',
  city: '',
  district: '',
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
};

const STEPS = [
  { id: 1, title: 'İşletme' },
  { id: 2, title: 'Adres' },
  { id: 3, title: 'Hesap' },
];

const TAX_NUMBER_REGEX = /^[0-9]{10,11}$/;

// Reusable field wrapper
function Field({
  label,
  required = false,
  children,
  error,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-charcoal">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-charcoal-light">{hint}</p>}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-danger flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

const inputCls = (hasIcon = true, error = false, extra = '') =>
  `w-full h-12 ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 bg-white border rounded-xl text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none transition-all duration-150 focus:ring-2 ${
    error
      ? 'border-danger/40 focus:border-danger focus:ring-danger/15'
      : 'border-card-border focus:border-primary-mid focus:ring-primary/15'
  } ${extra}`;

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('seller');
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingTax, setIsVerifyingTax] = useState(false);
  const [taxVerified, setTaxVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const p = formData.password;
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s += 25;
    if (/\d/.test(p)) s += 25;
    if (/[^a-zA-Z0-9]/.test(p)) s += 25;
    setPasswordStrength(s);
  }, [formData.password]);

  const goToStep = (next: number) => {
    setDirection(next > currentStep ? 1 : -1);
    setCurrentStep(next);
    setGlobalError('');
    setFieldErrors({});
  };

  const setField = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (key === 'tax_number') setTaxVerified(false);
  };

  // VKN format & duplicate check (called on blur or step submit)
  const verifyTaxNumber = async (silent = false): Promise<boolean> => {
    const value = formData.tax_number.trim();
    if (!TAX_NUMBER_REGEX.test(value)) {
      if (!silent) {
        setFieldErrors((prev) => ({
          ...prev,
          tax_number: 'VKN 10 veya 11 haneli rakam olmalıdır',
        }));
      }
      return false;
    }
    setIsVerifyingTax(true);
    try {
      const response = await authApi.verifyTaxNumber(value);
      if (response.data?.valid && !response.data?.already_registered) {
        setTaxVerified(true);
        if (!silent) toast.success('VKN doğrulandı', { position: 'bottom-right' });
        return true;
      }
      if (response.data?.already_registered) {
        setFieldErrors((prev) => ({ ...prev, tax_number: 'Bu VKN zaten kayıtlı' }));
        if (!silent) toast.error('Bu VKN zaten kayıtlı');
        return false;
      }
      const msg = response.data?.message || response.error || 'VKN doğrulanamadı';
      setFieldErrors((prev) => ({ ...prev, tax_number: msg }));
      return false;
    } finally {
      setIsVerifyingTax(false);
    }
  };

  // Step validators
  const validateStep1 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.tax_number) errors.tax_number = 'VKN gerekli';
    else if (!TAX_NUMBER_REGEX.test(formData.tax_number))
      errors.tax_number = 'VKN 10 veya 11 haneli rakam olmalıdır';
    if (!formData.business_name.trim()) errors.business_name = 'İşletme adı gerekli';
    else if (formData.business_name.trim().length < 2)
      errors.business_name = 'En az 2 karakter olmalı';
    if (!formData.nickname.trim()) errors.nickname = 'Yetkili kişi adı gerekli';
    if (formData.phone && !/^[0-9+\s()-]{7,20}$/.test(formData.phone))
      errors.phone = 'Geçerli bir telefon girin';
    return errors;
  };

  const validateStep2 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.city.trim()) errors.city = 'Şehir gerekli';
    if (!formData.district.trim()) errors.district = 'İlçe gerekli';
    if (!formData.address.trim()) errors.address = 'Adres gerekli';
    else if (formData.address.trim().length < 10)
      errors.address = 'Adres en az 10 karakter olmalı';
    return errors;
  };

  const validateStep3 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = 'E-posta gerekli';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Geçerli bir e-posta girin';
    if (!formData.password) errors.password = 'Şifre gerekli';
    else if (formData.password.length < 8)
      errors.password = 'Şifre en az 8 karakter olmalı';
    if (formData.password !== formData.password_confirmation)
      errors.password_confirmation = 'Şifreler eşleşmiyor';
    if (!acceptedTerms) errors.terms = 'Üyelik sözleşmesini kabul etmelisiniz';
    return errors;
  };

  const handleNextFromStep1 = async () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    // Verify VKN if not yet
    if (!taxVerified) {
      const ok = await verifyTaxNumber();
      if (!ok) return;
    }
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    goToStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStep3();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setGlobalError('');

    const payload: RegisterData = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      tax_number: formData.tax_number,
      business_name: formData.business_name.trim(),
      nickname: formData.nickname.trim(),
      phone: formData.phone || undefined,
      address: formData.address.trim(),
      city: formData.city.trim(),
      district: formData.district.trim(),
      role: accountType,
    } as RegisterData;

    const response = await authApi.register(payload);

    if (response.data) {
      api.setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Kayıt başarılı!', {
        description: 'Belge yükleme adımına yönlendiriliyorsunuz.',
        position: 'bottom-right',
      });
      router.push('/documents');
      return;
    }

    // Surface backend errors
    if (response.errors && typeof response.errors === 'object') {
      const backendErrors: Record<string, string> = {};
      let firstError = '';
      for (const [key, messages] of Object.entries(response.errors)) {
        if (Array.isArray(messages) && messages.length > 0) {
          backendErrors[key] = messages[0];
          if (!firstError) firstError = messages[0];
        }
      }
      setFieldErrors(backendErrors);
      // If error belongs to step 1 fields, jump back
      if (backendErrors.tax_number || backendErrors.business_name || backendErrors.nickname) {
        goToStep(1);
      } else if (backendErrors.address || backendErrors.city || backendErrors.district) {
        goToStep(2);
      }
      const msg = firstError || response.error || 'Kayıt başarısız';
      setGlobalError(msg);
      toast.error('Kayıt başarısız', { description: msg });
    } else {
      const msg = response.error || 'Kayıt başarısız';
      setGlobalError(msg);
      toast.error('Kayıt başarısız', { description: msg });
    }
    setIsSubmitting(false);
  };

  const slideVariants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d > 0 ? 240 : -240, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (d: number) => ({ x: d < 0 ? 240 : -240, opacity: 0 }),
    }),
    []
  );

  const strengthColor =
    passwordStrength <= 25
      ? '#dc2626'
      : passwordStrength <= 50
      ? '#f59e0b'
      : passwordStrength <= 75
      ? '#B89968'
      : '#10b981';
  const strengthLabel =
    passwordStrength <= 25
      ? 'Zayıf'
      : passwordStrength <= 50
      ? 'Orta'
      : passwordStrength <= 75
      ? 'İyi'
      : 'Güçlü';

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display italic text-[38px] text-[var(--ink)] leading-[1.05] -tracking-[.01em] mb-2">Hesap Oluştur</h1>
        <p className="text-[13.5px] text-[var(--ink-2)]">
          {accountType === 'seller'
            ? 'i-bijuteri pazaryerinde satış yapmaya hemen başlayın.'
            : 'i-bijuteri pazaryerinde toptan alışveriş yapmaya başlayın.'}
        </p>
      </div>

      {/* Account type tab */}
      <div className="login-seg">
        <button
          type="button"
          onClick={() => setAccountType('buyer')}
          className={accountType === 'buyer' ? 'active' : ''}
        >
          Alıcı (Kuyumcu)
        </button>
        <button
          type="button"
          onClick={() => setAccountType('seller')}
          className={accountType === 'seller' ? 'active' : ''}
        >
          Tedarikçi (Atölye)
        </button>
      </div>

      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'border-primary bg-primary text-white'
                        : isCurrent
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-card-border bg-white text-charcoal-light'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{step.id}</span>}
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide whitespace-nowrap ${
                      isCurrent ? 'text-primary' : 'text-charcoal-light'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 mb-4 rounded-full overflow-hidden bg-card-border">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global error */}
      <AnimatePresence mode="wait">
        {globalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 p-3 bg-danger-light border border-danger/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-sm text-danger font-medium">{globalError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* Step 1 — İşletme Bilgileri */}
          {currentStep === 1 && (
            <motion.div
              key="s1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div className="mb-1">
                <h2 className="text-lg font-extrabold text-charcoal">İşletme Bilgileri</h2>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Vergi kimlik numaranızı ve firmanızı tanıtın
                </p>
              </div>

              <Field
                label="Vergi Kimlik No (VKN)"
                required
                error={fieldErrors.tax_number}
                hint="10 haneli VKN veya 11 haneli T.C. kimlik numarası"
              >
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234567890"
                    value={formData.tax_number}
                    onChange={(e) =>
                      setField('tax_number', e.target.value.replace(/\D/g, '').slice(0, 11))
                    }
                    onBlur={() => {
                      if (formData.tax_number && !taxVerified) verifyTaxNumber(true);
                    }}
                    maxLength={11}
                    className={`${inputCls(true, !!fieldErrors.tax_number)} font-mono tracking-widest`}
                  />
                  {isVerifyingTax && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                  {!isVerifyingTax && taxVerified && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </Field>

              <Field label="İşletme / Firma Adı" required error={fieldErrors.business_name}>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type="text"
                    placeholder="Örnek: Altın Bijuteri Ltd. Şti."
                    value={formData.business_name}
                    onChange={(e) => setField('business_name', e.target.value)}
                    maxLength={150}
                    className={inputCls(true, !!fieldErrors.business_name)}
                  />
                </div>
              </Field>

              <Field
                label="Yetkili Kişi"
                required
                error={fieldErrors.nickname}
                hint="Sitede ve mesajlaşmada görünecek isim"
              >
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type="text"
                    placeholder="Örnek: Mehmet Yılmaz"
                    value={formData.nickname}
                    onChange={(e) => setField('nickname', e.target.value)}
                    maxLength={100}
                    className={inputCls(true, !!fieldErrors.nickname)}
                  />
                </div>
              </Field>

              <Field label="Telefon" error={fieldErrors.phone} hint="İsteğe bağlı">
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="0555 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    className={inputCls(true, !!fieldErrors.phone)}
                  />
                </div>
              </Field>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  disabled={isVerifyingTax}
                  className="w-full h-11 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isVerifyingTax ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> VKN Doğrulanıyor...
                    </>
                  ) : (
                    <>
                      Devam <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Adres */}
          {currentStep === 2 && (
            <motion.div
              key="s2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div className="mb-1">
                <h2 className="text-lg font-extrabold text-charcoal">Adres Bilgileri</h2>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Sevkiyat ve fatura adresinizi belirtin
                </p>
              </div>

              {taxVerified && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary-border bg-primary-light/40">
                  <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="text-xs text-primary-dark">
                    <span className="font-extrabold">{formData.business_name}</span> &middot; VKN:{' '}
                    <span className="font-mono">{formData.tax_number}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Şehir" required error={fieldErrors.city}>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                    <input
                      type="text"
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={(e) => setField('city', e.target.value)}
                      maxLength={60}
                      className={inputCls(true, !!fieldErrors.city)}
                    />
                  </div>
                </Field>
                <Field label="İlçe" required error={fieldErrors.district}>
                  <div className="relative">
                    <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                    <input
                      type="text"
                      placeholder="Kadıköy"
                      value={formData.district}
                      onChange={(e) => setField('district', e.target.value)}
                      maxLength={60}
                      className={inputCls(true, !!fieldErrors.district)}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Açık Adres" required error={fieldErrors.address}>
                <textarea
                  placeholder="Mahalle, sokak, bina no, daire"
                  value={formData.address}
                  onChange={(e) => setField('address', e.target.value)}
                  rows={3}
                  maxLength={500}
                  className={`w-full pl-4 pr-4 py-3 bg-white border rounded-xl text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none transition-all duration-150 focus:ring-2 resize-none ${
                    fieldErrors.address
                      ? 'border-danger/40 focus:border-danger focus:ring-danger/15'
                      : 'border-card-border focus:border-primary-mid focus:ring-primary/15'
                  }`}
                />
              </Field>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex-1 h-11 rounded-xl font-semibold text-sm text-charcoal-mid border border-card-border bg-white hover:bg-surface flex items-center justify-center gap-1.5 transition-all duration-150"
                >
                  <ArrowLeft className="w-4 h-4" /> Geri
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="flex-1 h-11 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark transition-all duration-150 group"
                >
                  Devam <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Hesap */}
          {currentStep === 3 && (
            <motion.form
              key="s3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >
              <div className="mb-1">
                <h2 className="text-lg font-extrabold text-charcoal">Hesap Bilgileri</h2>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Giriş için kullanacağınız e-posta ve şifre
                </p>
              </div>

              <Field label="E-posta Adresi" required error={fieldErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@firma.com"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    className={inputCls(true, !!fieldErrors.email)}
                  />
                </div>
              </Field>

              <Field label="Şifre" required error={fieldErrors.password}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="En az 8 karakter"
                    value={formData.password}
                    onChange={(e) => setField('password', e.target.value)}
                    className={`${inputCls(true, !!fieldErrors.password)} pr-12`}
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

                {formData.password && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map((t) => (
                        <div
                          key={t}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              passwordStrength >= t ? strengthColor : 'var(--color-card-border)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: strengthColor }}>
                      Şifre gücü: {strengthLabel}
                    </p>
                  </motion.div>
                )}
              </Field>

              <Field label="Şifre Tekrar" required error={fieldErrors.password_confirmation}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={(e) => setField('password_confirmation', e.target.value)}
                    className={`${inputCls(true, !!fieldErrors.password_confirmation)} pr-12`}
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
              </Field>

              {/* Terms */}
              <div
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  fieldErrors.terms ? 'bg-danger-light border-danger/30' : 'bg-surface border-card-border'
                }`}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked && fieldErrors.terms) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.terms;
                        return next;
                      });
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-card-border cursor-pointer accent-primary"
                />
                <label htmlFor="terms" className="text-xs text-charcoal-mid leading-relaxed cursor-pointer">
                  <Link
                    href="/sayfa/uyelik-sozlesmesi"
                    target="_blank"
                    className="font-extrabold text-primary hover:underline"
                  >
                    i-Bijuteri Üyelik Sözleşmesi
                  </Link>
                  &apos;ni ve{' '}
                  <Link
                    href="/sayfa/kvkk"
                    target="_blank"
                    className="font-extrabold text-primary hover:underline"
                  >
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum, kullanım koşullarını kabul ediyorum.
                </label>
              </div>
              {fieldErrors.terms && (
                <p className="text-xs text-danger flex items-center gap-1 -mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.terms}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex-1 h-11 rounded-xl font-semibold text-sm text-charcoal-mid border border-card-border bg-white hover:bg-surface flex items-center justify-center gap-1.5 transition-all duration-150"
                >
                  <ArrowLeft className="w-4 h-4" /> Geri
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Kayıt Yapılıyor...
                    </>
                  ) : (
                    <>
                      Kayıt Ol <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-card-border text-center">
        <p className="text-xs text-charcoal-light">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-extrabold text-primary hover:text-primary-dark transition-colors">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
