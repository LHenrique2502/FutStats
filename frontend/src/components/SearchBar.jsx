import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const SearchBar = ({
  placeholder = 'Buscar times, partidas ou ligas...',
  onSearch,
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
};
