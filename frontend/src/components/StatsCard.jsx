import { cn } from '@/lib/utils';

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 transition-glow hover:border-glow',
        'gradient-primary',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-success/20 text-success',
              trend === 'down' && 'bg-destructive/20 text-destructive',
              trend === 'stable' && 'bg-muted/50 text-muted-foreground'
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
