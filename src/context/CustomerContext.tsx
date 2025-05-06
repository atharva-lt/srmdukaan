
import React, { createContext, useContext, useState, useEffect } from "react";
import { Customer } from "@/types";

interface CustomerContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  isAuthenticated: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null);

  // Load customer from localStorage on component mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");
    if (savedCustomer) {
      try {
        setCustomerState(JSON.parse(savedCustomer));
      } catch (error) {
        console.error("Failed to parse customer from localStorage:", error);
      }
    }
  }, []);

  const setCustomer = (newCustomer: Customer | null) => {
    setCustomerState(newCustomer);
    if (newCustomer) {
      localStorage.setItem("customer", JSON.stringify(newCustomer));
    } else {
      localStorage.removeItem("customer");
    }
  };

  const isAuthenticated = !!customer;

  return (
    <CustomerContext.Provider
      value={{ customer, setCustomer, isAuthenticated }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
