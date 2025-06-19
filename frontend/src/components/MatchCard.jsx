import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const MatchCard = ({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  date,
  stadium,
  league,
  status,
  matchId = "1",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "FINALIZADO";
      default:
        return "AGENDADO";
    }
  };

  console.log("Valor de homeLogo:", homeLogo);

  return (
    <Link to={`/partida/${matchId}`}>
      <Card className=" mb-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline" className="text-xs">
              {league}
            </Badge>
            <Badge className={`${getStatusColor()} text-white text-xs`}>
              {getStatusText()}
            </Badge>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="font-semibold text-lg mb-1">{homeTeam}</div>
              <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <img
                  src={homeLogo}
                  alt={`Logo do ${homeTeam}`}
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>

            <div className="text-center px-4">
              {status === "completed" &&
              homeScore !== undefined &&
              awayScore !== undefined ? (
                <div className="text-3xl font-bold">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">
                  VS
                </div>
              )}
            </div>

            <div className="text-center flex-1">
              <div className="font-semibold text-lg mb-1">{awayTeam}</div>
              <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <img
                  src={awayLogo}
                  alt={`Logo do ${awayTeam}`}
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {date}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {stadium}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MatchCard;
