"use client";

import { useState } from "react";
import { SlimSidebar } from "./SlimSidebar";
import { ContextPanel } from "./ContextPanel";
import { PanelRightClose, PanelRightOpen, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./MobileSidebar"; // Reuse mobile sidebar for small screens

export function ConsoleLayout({ children, hideContextPanel = false }: { children: React.ReactNode; hideContextPanel?: boolean }) {
    const [showRightPanel, setShowRightPanel] = useState(!hideContextPanel);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
            {/* 1. Left Rail (Hidden on mobile) */}
            <div className="hidden md:block">
                <SlimSidebar />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Console Header */}
                <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur flex items-center justify-between px-4 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Command / Search..."
                                className="h-9 w-64 lg:w-96 pl-9 bg-muted/50 border-transparent focus:bg-background transition-all rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!hideContextPanel && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRightPanel(!showRightPanel)}
                                className="text-muted-foreground hover:text-foreground hidden lg:flex"
                            >
                                {showRightPanel ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                            </Button>
                        )}
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    <div className={`mx-auto animate-in fade-in duration-500 min-h-full ${hideContextPanel ? '' : 'max-w-7xl'}`}>
                        {children}
                    </div>
                </main>
            </div>

            {/* 3. Right Context Panel (Toggleable) */}
            {!hideContextPanel && (
                <ContextPanel isVisible={showRightPanel} onClose={() => setShowRightPanel(false)} />
            )}
        </div>
    );
}
