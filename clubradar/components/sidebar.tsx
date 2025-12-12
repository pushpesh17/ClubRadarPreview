"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  QrCode,
  DollarSign,
  Building2,
  CheckCircle2,
  FileText,
  AlertCircle,
  User,
  Home,
  LogOut,
  Settings,
  Menu,
  Ticket,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tabValue?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  mobileTitle?: string;
  onTabChange?: (value: string) => void;
  activeTab?: string;
}

export function Sidebar({ items, title, mobileTitle, onTabChange, activeTab }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Top Header with Menu Button */}
      <div className="lg:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold">{mobileTitle || title}</h2>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-6">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo || undefined} />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || user.phone || ""}</p>
                    </div>
                  </div>
                )}
                <Link
                  href="/#discover"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  Discover Clubs
                </Link>
                <Link
                  href="/#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/venue/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  Venue Dashboard
                </Link>
                <Link
                  href="/venue/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  Register Venue
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  Blog
                </Link>
                <div className="pt-4 border-t mt-4 space-y-2">
                  {user ? (
                    <>
                      <Button variant="outline" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/profile">Profile</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/bookings" className="flex items-center justify-center">
                          <Ticket className="mr-2 h-4 w-4" />
                          My Bookings
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/venue/signup">For Venues</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab ? activeTab === item.tabValue : pathname === item.href;
            const handleClick = (e: React.MouseEvent) => {
              if (item.tabValue && onTabChange) {
                e.preventDefault();
                onTabChange(item.tabValue);
              }
            };
            
            return (
              <Link
                key={item.tabValue || `${item.href}-${index}`}
                href={item.href}
                onClick={handleClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-primary"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-0.5", isActive && "text-primary")} />
                <span className="truncate max-w-[60px] leading-tight text-center">
                  {item.title.split(" ")[0]}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar - Completely hidden on mobile, doesn't affect layout */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:bg-background">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </Link>
        </div>
        
        {/* Profile Header */}
        {user && (
          <div className="border-b px-4 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-accent">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo || undefined} />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || user.phone || "Venue Account"}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email || user.phone || ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Home / Features
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/discover" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Discover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="flex items-center">
                    <Ticket className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab ? activeTab === item.tabValue : pathname === item.href;
            const handleClick = (e: React.MouseEvent) => {
              if (item.tabValue && onTabChange) {
                e.preventDefault();
                onTabChange(item.tabValue);
              }
            };
            return (
              <Link
                key={item.tabValue || `${item.href}-${index}`}
                href={item.href}
                onClick={handleClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

