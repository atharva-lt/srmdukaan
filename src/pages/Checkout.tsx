
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { createOrder } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer || !customer.id) {
      toast({
        title: "Error",
        description: "Please login before checking out",
        variant: "destructive",
      });
      navigate("/login", { state: { redirect: "/checkout" } });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const order = await createOrder(customer.id, items, address);
      
      if (order) {
        clearCart();
        navigate(`/thankyou/${order.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    navigate("/login", { state: { redirect: "/checkout" } });
    return null;
  }

  return (
    <div className="container p-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={customer.name || ""}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customer.email || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={customer.contact_number || ""}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full shipping address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product.name} × {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
