import { Target, Flag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const getIcon = (type) => {
  switch (type) {
    case 'goal':
      return Target;
    case 'corner':
      return Flag;
    case 'card':
      return AlertCircle;
    default:
      return Target;
  }
};

const getColor = (type) => {
  switch (type) {
    case 'goal':
      return 'text-success';
    case 'corner':
      return 'text-primary';
    case 'card':
      return 'text-warning';
    default:
      return 'text-foreground';
  }
};

export const MatchEventTimeline = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = getIcon(event.type);
        const colorClass = getColor(event.type);

        return (
          <div key={event.id || index} className="flex items-start gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'bg-card border-2 border-border rounded-full p-2',
                  colorClass
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              {index < events.length - 1 && (
                <div className="w-px h-8 bg-border mt-2" />
              )}
            </div>

            {/* Event details */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-primary">
                  {event.minute}'
                </span>
                <span className="text-sm text-muted-foreground">
                  {event.team}
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {event.player}
              </p>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
