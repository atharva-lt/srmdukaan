
import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThankYou() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container p-8 mx-auto">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">
              Thank you for your order. Your order has been placed successfully.
            </p>
            <div className="p-4 text-center bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono font-medium">{orderId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to="/account">View Order History</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
