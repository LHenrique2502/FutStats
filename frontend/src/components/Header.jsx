import {
  BarChart3,
  Menu,
  Trophy,
  Users,
  Target,
  Layers,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";

const Header = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Início", icon: BarChart3 },
    { path: "/jogos", label: "Jogos", icon: Trophy },
    { path: "/times", label: "Times", icon: Users },
    { path: "/ligas", label: "Ligas", icon: Layers },
    { path: "/scouts", label: "Scouts", icon: Target },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-foreground p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Football Analytics</h1>
          </div>

          <nav className="flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-foreground/10 ${
                    isActive ? "bg-primary-foreground/20" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-primary-foreground/10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
