'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import Cookies from 'js-cookie';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/useIsMobile';

const SidebarContext = React.createContext({});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  const { theme } = useTheme();

  React.useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    const mobileFromCookie = Cookies.get('mobile');
    if (mobileFromCookie === 'true') {
      setMobile(true);
    } else if (mobileFromCookie === 'false') {
      setMobile(false);
    }
  }, []);

  React.useEffect(() => {
    Cookies.set('mobile', String(mobile), { expires: 7 });
  }, [mobile]);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      mobile,
      setMobile,
      theme,
    }),
    [open, mobile, theme]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function Sidebar({ children }) {
  const { open, setOpen, mobile } = useSidebar();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile, setOpen]);

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Toggle sidebar">
            {/* Ícone de menu aqui */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r bg-background transition-all',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      {children}
    </div>
  );
}

export function SidebarTrigger({ className, children, ...props }) {
  const { setOpen } = useSidebar();
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('md:hidden', className)}
      onClick={() => setOpen((o) => !o)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SidebarHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b',
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-center p-4 border-t', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }) {
  return (
    <nav
      className={cn('flex flex-col p-4 overflow-y-auto', className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }) {
  return <ul className={cn('flex flex-col space-y-1', className)} {...props} />;
}

export function SidebarMenuItem({ className, children, ...props }) {
  const pathname = usePathname();
  const active = pathname === props.href;
  return (
    <li>
      <a
        href={props.href}
        className={cn(
          'block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
          active && 'bg-accent text-accent-foreground',
          className
        )}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

export function SidebarMenuButton({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuAction({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-destructive hover:text-destructive-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarSeparator(props) {
  return <Separator className="my-2" {...props} />;
}

export function SidebarSearchInput({ className, ...props }) {
  return (
    <Input
      type="search"
      placeholder="Search..."
      className={cn('mb-2 w-full rounded-md border', className)}
      {...props}
    />
  );
}
