
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Truck, Package } from "lucide-react";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Mock shipping options
  const shippingOptions = {
    standard: { name: "Standard Shipping", price: 0.00, days: "3-5 business days" },
    express: { name: "Express Shipping", price: 9.99, days: "1-2 business days" },
    nextDay: { name: "Next Day Delivery", price: 19.99, days: "Next business day" }
  };

  // Calculate total with shipping
  const shippingCost = shippingOptions[shippingMethod as keyof typeof shippingOptions].price;
  const orderTotal = subtotal + shippingCost;

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
            <Card className="mb-8">
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
              </form>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={shippingMethod} 
                  onValueChange={setShippingMethod}
                  className="space-y-3"
                >
                  {Object.entries(shippingOptions).map(([key, option]) => (
                    <div key={key} className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value={key} id={`shipping-${key}`} />
                      <Label htmlFor={`shipping-${key}`} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{option.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({option.days})</span>
                          </div>
                          <span>{option.price === 0 ? "FREE" : `$${option.price.toFixed(2)}`}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="credit_card" id="payment-card" />
                    <Label htmlFor="payment-card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Credit / Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="paypal" id="payment-paypal" />
                    <Label htmlFor="payment-paypal" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>PayPal</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="cash_on_delivery" id="payment-cod" />
                    <Label htmlFor="payment-cod" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Cash on Delivery</span>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === "credit_card" && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input id="expiryDate" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input id="nameOnCard" placeholder="John Doe" />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || items.length === 0 || !address.trim()}
                  onClick={handleSubmit}
                >
                  {loading ? "Processing..." : `Pay $${orderTotal.toFixed(2)}`}
                </Button>
              </CardFooter>
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
                    <span>
                      {shippingCost === 0 
                        ? "FREE" 
                        : `$${shippingCost.toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">
                      ${orderTotal.toFixed(2)}
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
