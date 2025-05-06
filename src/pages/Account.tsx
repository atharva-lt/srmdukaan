
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { OrderSummary } from "@/types";
import { formatDate } from "@/lib/utils";

export default function Account() {
  const { customer, isAuthenticated } = useCustomer();
  const { userRole } = useRole();
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
        
        // Map the order summary data to match our expected types
        const orderSummaries = data.map((order) => ({
          ...order,
          order_status: order.status,
          payment_status: null
        })) as OrderSummary[];
        
        setOrders(orderSummaries || []);
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

  const getStatusBadgeClasses = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-srm-700">My Account</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Card className="border-srm-100">
            <CardHeader className="bg-srm-50">
              <CardTitle className="text-srm-700">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
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
              <div className="pt-2 mt-4 border-t border-srm-50">
                <p className="text-sm text-muted-foreground">Current Role</p>
                <p className="font-medium capitalize">{userRole}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full border-srm-100">
            <CardHeader className="pb-3 bg-srm-50">
              <CardTitle className="text-xl font-semibold text-srm-700">Order History</CardTitle>
              <CardDescription>
                View the status of recent orders and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-srm-50 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-srm-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.order_id} className="hover:bg-srm-50/50">
                        <TableCell className="font-medium text-srm-700">
                          {(order.order_id || "").slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {order.order_date
                            ? formatDate(new Date(order.order_date))
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          ${order.total_amount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStatusBadgeClasses(order.order_status)
                          }`}>
                            {order.order_status || "Processing"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <span className="text-srm-500">
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
            <CardFooter className="bg-srm-50/50">
              <Button variant="outline" onClick={() => navigate("/")} className="border-srm-200 text-srm-600 hover:bg-srm-50">
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
