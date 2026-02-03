import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  className,
}: StatCardProps) {
  // Extract background color from iconClassName for the icon container
  const getIconBgColor = () => {
    if (iconClassName?.includes('text-blue')) return 'bg-blue-100 dark:bg-blue-900/20';
    if (iconClassName?.includes('text-green')) return 'bg-green-100 dark:bg-green-900/20';
    if (iconClassName?.includes('text-red')) return 'bg-red-100 dark:bg-red-900/20';
    if (iconClassName?.includes('text-yellow')) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (iconClassName?.includes('text-orange')) return 'bg-orange-100 dark:bg-orange-900/20';
    if (iconClassName?.includes('text-purple')) return 'bg-purple-100 dark:bg-purple-900/20';
    if (iconClassName?.includes('text-amber')) return 'bg-amber-100 dark:bg-amber-900/20';
    return 'bg-gray-100 dark:bg-gray-900/20';
  };

  return (
    <Card className={cn('rounded-xl border shadow-sm hover:shadow-md transition-shadow', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-full ml-4', getIconBgColor())}>
            <Icon className={cn('h-6 w-6', iconClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
