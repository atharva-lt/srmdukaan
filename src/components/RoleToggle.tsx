
import React from "react";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/context/RoleContext";
import { Store, ShoppingCart } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function RoleToggle() {
  const { userRole, toggleRole } = useRole();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 bg-muted/50 p-1 px-2 rounded-full transition-all">
            <ShoppingCart 
              className={`w-4 h-4 transition-colors ${userRole === "consumer" ? "text-primary" : "text-muted-foreground"}`} 
            />
            <Switch 
              id="role-toggle" 
              checked={userRole === "seller"}
              onCheckedChange={toggleRole}
              className="data-[state=checked]:bg-primary"
            />
            <Store 
              className={`w-4 h-4 transition-colors ${userRole === "seller" ? "text-primary" : "text-muted-foreground"}`} 
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Switch between {userRole === "consumer" ? "Seller" : "Consumer"} Mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
