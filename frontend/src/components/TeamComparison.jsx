import { cn } from '@/lib/utils';

export const TeamComparison = ({ homeTeam, awayTeam, stats }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-3xl mb-2">{homeTeam.logo}</div>
          <p className="font-semibold text-foreground">{homeTeam.name}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            VS
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">{awayTeam.logo}</div>
          <p className="font-semibold text-foreground">{awayTeam.name}</p>
        </div>
      </div>

      {/* Stats comparison */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {stat.homeValue}
              </span>
              <span className="text-xs text-muted-foreground uppercase">
                {stat.label}
              </span>
              <span className="font-medium text-foreground">
                {stat.awayValue}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 h-2 rounded-full overflow-hidden bg-muted">
              <div
                className={cn(
                  'bg-primary rounded-l-full transition-all',
                  stat.homeValue > stat.awayValue && 'opacity-100',
                  stat.homeValue < stat.awayValue && 'opacity-50'
                )}
                style={{ width: '100%' }}
              />
              <div
                className={cn(
                  'bg-accent rounded-r-full transition-all',
                  stat.awayValue > stat.homeValue && 'opacity-100',
                  stat.awayValue < stat.homeValue && 'opacity-50'
                )}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
