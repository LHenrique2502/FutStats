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
