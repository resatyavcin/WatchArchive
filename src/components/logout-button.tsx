"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-muted-foreground hover:text-foreground gap-1.5"
      aria-label="Çıkış yap"
    >
      <LogOut className="h-4 w-4" />
      Çıkış
    </Button>
  );
}
