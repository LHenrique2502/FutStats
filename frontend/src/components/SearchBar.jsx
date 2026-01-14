import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';

export const SearchBar = ({
  placeholder = 'Buscar times, partidas ou ligas...',
  onSearch,
  value,
  onChange,
}) => {
  const lastTrackedLenRef = useRef(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        value={value}
        onChange={(e) => {
          onChange?.(e);
          onSearch?.(e.target.value);

          // Tracking: envia apenas tamanho (privacidade), com debounce
          const len = String(e.target.value || '').trim().length;
          if (debounceRef.current) window.clearTimeout(debounceRef.current);
          debounceRef.current = window.setTimeout(() => {
            // evita spam: só registra quando cruza 3+ caracteres e muda significativamente
            if (len >= 3 && Math.abs(len - lastTrackedLenRef.current) >= 2) {
              lastTrackedLenRef.current = len;
              trackEvent('search_used', {
                query_length: len,
                placeholder,
              });
            }
          }, 600);
        }}
      />
    </div>
  );
};
