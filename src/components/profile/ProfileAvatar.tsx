/**
 * Profile Avatar Component
 * Displays user avatar with name and email
 */

"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserInitials } from "@/hooks/profile";

interface ProfileAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
}

export const ProfileAvatar = memo(function ProfileAvatar({ user }: ProfileAvatarProps) {
  const userInitials = useUserInitials(user.name);

  return (
    <div className="flex flex-col xs:flex-row items-center xs:items-start gap-3 xs:gap-4">
      <Avatar className="h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 shrink-0">
        <AvatarImage
          src={user.picture || ""}
          alt={user.name || "User avatar"}
          className="object-cover"
        />
        <AvatarFallback className="text-sm xs:text-base sm:text-lg font-medium bg-primary text-primary-foreground">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <div className="text-center xs:text-left min-w-0 flex-1 w-full overflow-hidden">
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold cursor-help overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
              {user.name || "User"}
            </h2>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{user.name || "User"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild={true}>
            <p className="text-muted-foreground text-xs xs:text-sm sm:text-base cursor-help mt-1 break-all overflow-wrap-anywhere hyphens-auto leading-relaxed">
              {user.email}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-all">{user.email}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
