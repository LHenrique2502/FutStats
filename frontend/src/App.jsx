import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { RouteAnalytics } from './components/RouteAnalytics';
import Home from './pages/Home';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import ValueBets from './pages/ValueBets';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Team from './pages/Team';
import Match from './pages/Match';
import League from './pages/League';
import Metodologia from './pages/Metodologia';
import Favoritos from './pages/Favoritos';
import Tools from './pages/Tools';
import ImpliedProbability from './pages/ImpliedProbability';
import ValueChecker from './pages/ValueChecker';
import ValueBetsToday from './pages/ValueBetsToday';
import OddsToday from './pages/OddsToday';
import LeagueMarketToday from './pages/LeagueMarketToday';
import Guides from './pages/Guides';
import GuideOver25 from './pages/GuideOver25';
import GuideBTTS from './pages/GuideBTTS';
import GuideProbabilidadeImplicita from './pages/GuideProbabilidadeImplicita';
import GuideValueBet from './pages/GuideValueBet';
import GuideComoUsarFutStats from './pages/GuideComoUsarFutStats';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteAnalytics />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/value-bets" element={<ValueBets />} />
          <Route path="/value-bets-hoje" element={<ValueBetsToday />} />
          <Route path="/over-25-odds-hoje" element={<OddsToday />} />
          <Route path="/btts-odds-hoje" element={<OddsToday />} />
          <Route path="/1x2-odds-hoje" element={<OddsToday />} />
          <Route
            path="/odds/:leagueSlug/:market/hoje"
            element={<LeagueMarketToday />}
          />
          <Route path="/ferramentas" element={<Tools />} />
          <Route
            path="/ferramentas/probabilidade-implicita"
            element={<ImpliedProbability />}
          />
          <Route path="/ferramentas/value-checker" element={<ValueChecker />} />
          <Route path="/guias" element={<Guides />} />
          <Route path="/guias/over-25" element={<GuideOver25 />} />
          <Route path="/guias/btts" element={<GuideBTTS />} />
          <Route
            path="/guias/probabilidade-implicita"
            element={<GuideProbabilidadeImplicita />}
          />
          <Route path="/guias/value-bet" element={<GuideValueBet />} />
          <Route
            path="/guias/como-usar-futstats"
            element={<GuideComoUsarFutStats />}
          />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/team/:id" element={<Team />} />
          <Route path="/match/:id" element={<Match />} />
          <Route path="/leagues" element={<League />} />
          <Route path="/metodologia" element={<Metodologia />} />
          <Route path="/favoritos" element={<Favoritos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
