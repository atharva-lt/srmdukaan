
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { OrderSummary } from "@/types";

export default function Account() {
  const { customer, isAuthenticated } = useCustomer();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      if (!customer?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("order_summary")
          .select("*")
          .order("order_date", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container p-8 mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{customer?.contact_number || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View the status of recent orders and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.order_id}>
                        <TableCell className="font-medium">
                          {(order.order_id || "").slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {order.order_date
                            ? new Date(order.order_date).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          ${order.total_amount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.order_status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.order_status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.order_status || "Processing"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <span className="text-primary">
                              {order.tracking_number}
                            </span>
                          ) : (
                            "Not available"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate("/")}>
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
