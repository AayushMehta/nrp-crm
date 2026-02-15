"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { chartVariants } from '@/lib/animation-utils';
import { ReactNode } from 'react';

interface ChartContainerProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
  showExport?: boolean;
  onExport?: () => void;
  variant?: 'default' | 'glass' | 'elevated';
}

export function ChartContainer({
  title,
  description,
  loading = false,
  error,
  isEmpty = false,
  emptyMessage = 'No data available',
  children,
  className,
  showExport = false,
  onExport,
  variant = 'default',
}: ChartContainerProps) {
  const cardClassName = `${className || ''} ${
    variant === 'glass' ? 'card-glass' : variant === 'elevated' ? 'card-elevated' : ''
  }`;

  return (
    <motion.div
      variants={chartVariants}
      initial="initial"
      animate="animate"
    >
      <Card className={cardClassName}>
        {(title || description || showExport) && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {showExport && onExport && !loading && !error && !isEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-8 px-2 lg:px-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </CardHeader>
        )}
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Failed to load chart</p>
                <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
              </div>
            </div>
          )}

          {isEmpty && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
              <div className="rounded-full bg-muted p-3">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          )}

          {!loading && !error && !isEmpty && children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton component for loading state
export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="space-y-3" style={{ height }}>
      <div className="space-y-2">
        <div className="h-4 w-1/4 bg-muted rounded shimmer" />
        <div className="h-3 w-1/3 bg-muted rounded shimmer" />
      </div>
      <div className="h-[280px] bg-muted rounded shimmer" />
      <div className="flex justify-center space-x-4">
        <div className="h-3 w-20 bg-muted rounded shimmer" />
        <div className="h-3 w-20 bg-muted rounded shimmer" />
        <div className="h-3 w-20 bg-muted rounded shimmer" />
      </div>
    </div>
  );
}
