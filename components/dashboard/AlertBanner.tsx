"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig = {
  info: {
    icon: Info,
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
    descColor: 'text-blue-700 dark:text-blue-300',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
    descColor: 'text-green-700 dark:text-green-300',
  },
  warning: {
    icon: AlertCircle,
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    titleColor: 'text-orange-900 dark:text-orange-100',
    descColor: 'text-orange-700 dark:text-orange-300',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
    descColor: 'text-red-700 dark:text-red-300',
  },
};

export function AlertBanner({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  action,
  className,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'rounded-lg border-l-4 p-4',
            config.borderColor,
            config.bgColor,
            className
          )}
        >
          <div className="flex items-start gap-3">
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', config.titleColor)}>
                {title}
              </p>
              {description && (
                <p className={cn('text-xs mt-1', config.descColor)}>
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={action.onClick}
                  className={cn(
                    'h-8 text-xs',
                    variant === 'info' && 'border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30',
                    variant === 'success' && 'border-green-300 hover:bg-green-100 dark:hover:bg-green-900/30',
                    variant === 'warning' && 'border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30',
                    variant === 'error' && 'border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                  )}
                >
                  {action.label}
                </Button>
              )}

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className={cn(
                    'p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
                    config.iconColor
                  )}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
