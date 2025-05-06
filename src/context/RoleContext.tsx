
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

interface RoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>("consumer");

  // Load role from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "consumer" || savedRole === "seller") {
      setUserRoleState(savedRole);
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem("userRole", role);
  };

  const toggleRole = () => {
    const newRole = userRole === "consumer" ? "seller" : "consumer";
    setUserRole(newRole);
  };

  return (
    <RoleContext.Provider value={{ userRole, setUserRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
