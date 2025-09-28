/**
 * Authentication Button Component
 * Handles sign in/out with avatar dropdown and theme integration
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { FileText, LogIn, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInitials } from "@/hooks/profile";

export function AuthButton() {
  const { user, isLoading, loginWithRedirect, logout } = useAuth0();

  // Always call hooks at the top level
  const userInitials = useUserInitials(user?.name);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Not authenticated - show login button
  if (!user) {
    return (
      <Button size="sm" variant="inverted" onClick={() => loginWithRedirect()}>
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  // Authenticated - show user avatar with dropdown

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          variant="ghost"
          className="relative h-10 w-auto px-2 gap-2 hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.picture || ""}
              alt={user.name || "User avatar"}
              className="object-cover"
            />
            <AvatarFallback className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium truncate max-w-24">{user.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate max-w-24">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64"
        align="end"
        forceMount={true}
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-black dark:text-white">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild={true}>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild={true}>
          <Link href="/files" className="flex items-center gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            My QR Codes
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild={true}>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
