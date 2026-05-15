'use client';

import { cn } from '@/lib/utils';

export type SellerType = 'individual' | 'corporate';

interface SellerTypeBadgeProps {
  /** Yeni: doğrudan satıcı tipi */
  sellerType?: SellerType;
  /** Backward-compat: derive from user role (seller → individual; buyer → corporate) */
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Individual Seller Icon (kişi rozeti)
const IndividualIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
    <circle cx="12" cy="9.5" r="3" fill="white" />
    <path
      d="M5 19c0-3.5 3-6 7-6s7 2.5 7 6"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Corporate Seller Icon (bina)
const CorporateIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M3 21V7L12 3L21 7V21H3Z" fill="currentColor" />
    <rect x="6" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="10.5" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="15" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="6" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="10.5" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="15" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="9.5" y="17" width="5" height="4" rx="0.5" fill="white" />
  </svg>
);

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function deriveSellerType(
  sellerType: SellerType | undefined,
  role: string | undefined,
): SellerType | null {
  if (sellerType === 'individual' || sellerType === 'corporate') {
    return sellerType;
  }
  if (!role) return null;
  if (role === 'seller' || role === 'individual') {
    return 'individual';
  }
  if (role === 'buyer' || role === 'corporate') {
    return 'corporate';
  }
  return null;
}

export function SellerTypeBadge({
  sellerType,
  role,
  size = 'md',
  showLabel = false,
  className,
}: SellerTypeBadgeProps) {
  const resolved = deriveSellerType(sellerType, role);

  if (!resolved) {
    return null;
  }

  const isIndividual = resolved === 'individual';
  const Icon = isIndividual ? IndividualIcon : CorporateIcon;
  const label = isIndividual ? 'Bireysel Satıcı' : 'Kurumsal Satıcı';

  return (
    <div
      className={cn('inline-flex items-center gap-1.5', className)}
      title={label}
    >
      <Icon className={cn(sizeClasses[size], 'text-charcoal')} />
      {showLabel && (
        <span className={cn(labelSizeClasses[size], 'text-charcoal-mid font-medium')}>
          {label}
        </span>
      )}
    </div>
  );
}

// Export individual icons for direct use
export { IndividualIcon, CorporateIcon };
