import { Lightbulb } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import { ProbabilityBadge } from './ProbabilityBadge';

export const InsightsBox = ({ title, description, probability, trend }) => {
  return (
    <div className="bg-card border border-primary/30 rounded-lg p-4 glow-subtle transition-glow hover:glow-primary">
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-2 rounded-lg shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {trend && <TrendIndicator trend={trend} size="sm" />}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {probability !== undefined && (
            <div className="pt-2">
              <ProbabilityBadge percentage={probability} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
