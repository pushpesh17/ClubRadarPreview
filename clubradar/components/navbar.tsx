"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MapPin, Menu, X, User, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { signOut: clerkSignOut } = useClerk();

  // Note: Using Clerk user data directly
  // Supabase sync can be added later if needed for additional profile data

  const handleLogout = async () => {
    try {
      await clerkSignOut();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      {/* Gradient border line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-30" />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-tight group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-purple-700 transition-all duration-300">
            ClubRadar
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex flex-1 justify-center max-w-2xl">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-9 px-4 text-sm font-medium text-foreground/90 hover:text-foreground data-[state=open]:text-foreground">
                For Users
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-2 w-[400px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/discover"
                        className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                      >
                        <div className="text-sm font-semibold leading-none group-hover:text-purple-600 transition-colors">
                          Discover Clubs
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                          Find the hottest clubs and events in your city
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/#features"
                        className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                      >
                        <div className="text-sm font-semibold leading-none group-hover:text-purple-600 transition-colors">
                          Book Entry Passes
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                          Skip the queue with instant QR-based entry
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-9 px-4 text-sm font-medium text-foreground/90 hover:text-foreground data-[state=open]:text-foreground">
                For Venues
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-2 w-[400px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/venue/dashboard"
                        className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                      >
                        <div className="text-sm font-semibold leading-none group-hover:text-purple-600 transition-colors">
                          Venue Dashboard
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                          Manage events, bookings, and earnings
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/venue/signup"
                        className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                      >
                        <div className="text-sm font-semibold leading-none group-hover:text-purple-600 transition-colors">
                          Register Your Venue
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                          Join ClubRadar and grow your business
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/blog"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Blog
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-1 mt-6">
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                Discover Clubs
              </Link>
              <Link
                href="/#features"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                Features
              </Link>
              <Link
                href="/venue/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                Venue Dashboard
              </Link>
              <Link
                href="/venue/signup"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                Register Venue
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                Blog
              </Link>
              <div className="pt-4 border-t mt-4 space-y-2">
                {!loading && user ? (
                  <>
                    <div className="px-4 py-3 mb-2 rounded-lg bg-accent/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-purple-200 dark:border-purple-800">
                          <AvatarImage src={user?.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {user?.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user?.email?.charAt(0).toUpperCase() || (
                                  <User className="h-4 w-4" />
                                )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-10"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/discover">Discover</Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-10"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/profile">Profile</Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-10"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link
                        href="/bookings"
                        className="flex items-center justify-center"
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : !loading ? (
                  <>
                    <Button
                      asChild
                      className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-10"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-10"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/venue/signup">For Venues</Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2.5 h-9 px-3 hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 border-2 border-purple-200 dark:border-purple-800">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-sm">
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : user?.email?.charAt(0).toUpperCase() || (
                            <User className="h-4 w-4" />
                          )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm font-medium text-foreground/90 max-w-[120px] truncate">
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/discover"
                    className="flex items-center cursor-pointer"
                  >
                    Discover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/bookings"
                    className="flex items-center cursor-pointer"
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="h-9 px-4 text-sm font-medium"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="h-9 px-4 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-sm"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
