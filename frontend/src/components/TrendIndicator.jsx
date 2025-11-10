import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TrendIndicator = ({ trend, value, label, size = 'md' }) => {
  const Icon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-medium',
        sizeClasses[size],
        trend === 'up' && 'bg-success/20 text-success',
        trend === 'down' && 'bg-destructive/20 text-destructive',
        trend === 'stable' && 'bg-muted/50 text-muted-foreground'
      )}
    >
      <Icon className={iconSizes[size]} />
      {value !== undefined && (
        <span>
          {value > 0 ? '+' : ''}
          {value}%
        </span>
      )}
      {label && <span>{label}</span>}
    </div>
  );
};
