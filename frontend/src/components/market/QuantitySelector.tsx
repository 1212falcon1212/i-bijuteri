'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function QuantitySelector({
    value,
    onChange,
    min = 1,
    max = 9999,
    step = 1,
    disabled = false,
    size = 'md',
    className,
}: QuantitySelectorProps) {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleDecrease = () => {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
    };

    const handleIncrease = () => {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (val === '') return;
        const numValue = parseInt(val, 10);
        if (!isNaN(numValue)) {
            const clampedValue = Math.min(Math.max(numValue, min), max);
            onChange(clampedValue);
        }
    };

    const handleBlur = () => {
        if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
            setInputValue(value.toString());
        } else {
            const numValue = parseInt(inputValue, 10);
            const clampedValue = Math.min(Math.max(numValue, min), max);
            setInputValue(clampedValue.toString());
            onChange(clampedValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleIncrease();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleDecrease();
        } else if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const heightClass = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-14' : 'h-11';
    const buttonClass = size === 'sm' ? 'w-8 text-sm' : size === 'lg' ? 'w-12 text-lg' : 'w-10 text-base';
    const inputClass = size === 'sm' ? 'w-10 text-[12px]' : size === 'lg' ? 'w-14 text-[15px]' : 'w-12 text-[13px]';

    return (
        <div
            className={cn(
                'inline-flex items-center border border-[var(--line)] bg-[var(--bg)]',
                heightClass,
                disabled && 'opacity-50 pointer-events-none',
                className,
            )}
        >
            <button
                type="button"
                className={cn(
                    buttonClass,
                    'h-full bg-transparent border-0 text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-40 grid place-items-center font-sans',
                )}
                onClick={handleDecrease}
                disabled={disabled || value <= min}
                aria-label="Azalt"
            >
                −
            </button>

            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={cn(
                    inputClass,
                    'h-full border-0 text-center font-medium text-[var(--ink)] bg-transparent outline-0 focus:outline-0',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                )}
            />

            <button
                type="button"
                className={cn(
                    buttonClass,
                    'h-full bg-transparent border-0 text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-40 grid place-items-center font-sans',
                )}
                onClick={handleIncrease}
                disabled={disabled || value >= max}
                aria-label="Arttır"
            >
                +
            </button>
        </div>
    );
}
