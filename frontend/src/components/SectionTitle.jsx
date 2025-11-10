import { cn } from '@/lib/utils';

export const SectionTitle = ({ title, subtitle, icon: Icon, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-primary/10 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
    </div>
  );
};
