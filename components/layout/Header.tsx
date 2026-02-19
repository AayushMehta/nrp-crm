'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 px-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 sticky top-0">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global Search (Placeholder for now) */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients, portfolios, or quick actions..."
            className="pl-9 h-9 w-full md:w-[400px] lg:w-[500px] bg-muted/50 border-muted-foreground/10 focus-visible:bg-background transition-all rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
