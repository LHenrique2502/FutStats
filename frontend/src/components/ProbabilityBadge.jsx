import { cn } from '@/lib/utils';

export const ProbabilityBadge = ({ percentage, label, size = 'md' }) => {
  const value =
    typeof percentage === 'number' ? percentage : Number(percentage);
  const isValid = Number.isFinite(value);

  const getColor = (value) => {
    if (value >= 75) return 'success';
    if (value >= 50) return 'warning';
    return 'destructive';
  };

  const color = isValid ? getColor(value) : 'neutral';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const percentageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-bold',
        sizeClasses[size],
        color === 'neutral' &&
          'bg-muted text-muted-foreground border border-border',
        color === 'success' &&
          'bg-success/20 text-success border border-success/30',
        color === 'warning' &&
          'bg-warning/20 text-warning border border-warning/30',
        color === 'destructive' &&
          'bg-destructive/20 text-destructive border border-destructive/30'
      )}
    >
      <span className={percentageSizeClasses[size]}>
        {isValid ? `${Math.round(value)}%` : '--'}
      </span>
      {label && <span className="font-medium opacity-90">{label}</span>}
    </div>
  );
};
