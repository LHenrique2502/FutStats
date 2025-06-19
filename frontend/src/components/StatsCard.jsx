import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = "",
  href,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const CardComponent = (
    <Card
      className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        href ? "cursor-pointer" : ""
      } ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {description && (
          <p className={`text-xs font-medium ${getTrendColor()}`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {CardComponent}
      </Link>
    );
  }

  return CardComponent;
};

export default StatsCard;
