import { Link } from 'react-router-dom';
import { BarChart3, Bookmark } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:glow-subtle transition-all">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold">
            Fut<span className="text-primary">Stats</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => trackEvent('nav_click', { to: '/', label: 'Home' })}
          >
            Home
          </Link>
          <Link
            to="/matches"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => trackEvent('nav_click', { to: '/matches', label: 'Partidas' })}
          >
            Partidas
          </Link>
          <Link
            to="/value-bets"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => trackEvent('nav_click', { to: '/value-bets', label: 'Probabilidades' })}
          >
            Probabilidades
          </Link>
          <Link
            to="/metodologia"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => trackEvent('nav_click', { to: '/metodologia', label: 'Metodologia' })}
          >
            Metodologia
          </Link>
          <Link
            to="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => trackEvent('nav_click', { to: '/blog', label: 'Blog' })}
          >
            Blog
          </Link>
          <Link
            to="/favoritos"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
            onClick={() => trackEvent('nav_click', { to: '/favoritos', label: 'Favoritos' })}
            title="Favoritos"
          >
            <Bookmark className="w-4 h-4" />
            Favoritos
          </Link>
        </nav>
      </div>
    </header>
  );
};
