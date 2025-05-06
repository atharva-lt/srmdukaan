
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/context/RoleContext";
import { Store, ShoppingCart } from "lucide-react";

export default function RoleToggle() {
  const { userRole, toggleRole } = useRole();
  
  return (
    <div className="flex items-center gap-2">
      <ShoppingCart className={`w-4 h-4 ${userRole === "consumer" ? "text-primary" : "text-muted-foreground"}`} />
      <Switch 
        id="role-toggle" 
        checked={userRole === "seller"}
        onCheckedChange={toggleRole}
      />
      <Store className={`w-4 h-4 ${userRole === "seller" ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
}
