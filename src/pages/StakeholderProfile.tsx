import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, endOfDay } from "date-fns";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, ArrowLeft, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDialog } from "@/components/invoice/InvoiceDialog";
import { StakeholderProfileCard } from "@/components/stakeholder-profile/StakeholderProfileCard";
import { DateRangeSelector } from "@/components/stakeholder-profile/DateRangeSelector";
import { OrderDetailsDialog } from "@/components/stakeholder-profile/OrderDetailsDialog";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, window.innerWidth < 640 ? "dd/MM/yy" : "PPP");
};

const StakeholderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoice, setShowInvoice] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stakeholder, isLoading: isLoadingStakeholder } = useQuery({
    queryKey: ["stakeholder", id],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["stakeholder-orders", id, startDate, endDate],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      let query = supabase
        .from("orders")
        .select(`
          *,
          buyer:stakeholders!orders_buyer_id_fkey(name),
          seller:stakeholders!orders_seller_id_fkey(name),
          order_items(
            id,
            price,
            weight,
            quantity,
            buyer_dalali_rate,
            seller_dalali_rate,
            dalali_type,
            item:items(name)
          )
        `)
        .or(`buyer_id.eq.${id},seller_id.eq.${id}`)
        .eq("user_id", session.session.user.id)
        .order("order_date", { ascending: false });

      if (startDate) {
        query = query.gte("order_date", startDate.toISOString());
      }
      if (endDate) {
        const endOfDayDate = endOfDay(endDate);
        query = query.lte("order_date", endOfDayDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: selectedOrderItems } = useQuery({
    queryKey: ["order-items", selectedOrder],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          item:items(name)
        `)
        .eq("order_id", selectedOrder);

      if (error) throw error;
      return data;
    },
  });

  const updateOrderBillPaidMutation = useMutation({
    mutationFn: async ({ orderId, billPaid }: { orderId: string; billPaid: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { error } = await supabase
        .from("orders")
        .update({ bill_paid: billPaid })
        .eq("id", orderId)
        .eq("user_id", session.session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholder-orders"] });
      toast({
        title: "Success",
        description: "Bill payment status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bill payment status",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log("Starting deletion process for order:", orderId);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) {
        throw new Error("No user found");
      }
      
      // First, get the order details to know which stakeholders are involved
      const { data: orderData, error: fetchError } = await supabase
        .from("orders")
        .select("buyer_id, seller_id, id")
        .eq("id", orderId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching order details:", fetchError);
        throw new Error(`Failed to fetch order details: ${fetchError.message}`);
      }
      
      if (!orderData) {
        throw new Error("Order not found");
      }
      
      console.log("Found order:", orderData);
      
      try {
        // Delete order items first
        const { error: itemsError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId);
        
        if (itemsError) {
          console.error("Error deleting order items:", itemsError);
          throw new Error(`Failed to delete order items: ${itemsError.message}`);
        }
        
        console.log("Successfully deleted order items");
        
        // Then delete the main order
        const { error: orderError } = await supabase
          .from("orders")
          .delete()
          .eq("id", orderId);
        
        if (orderError) {
          console.error("Error deleting order:", orderError);
          throw new Error(`Failed to delete order: ${orderError.message}`);
        }
        
        console.log("Successfully deleted order");
        
        // Return stakeholder IDs for query invalidation
        return { 
          success: true, 
          buyerId: orderData.buyer_id,
          sellerId: orderData.seller_id,
          orderId: orderData.id
        };
      } catch (error: any) {
        console.error("Error in deletion process:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log("Delete mutation successful:", result);
      
      // Clear selected order if it was the one deleted
      if (selectedOrder === result.orderId) {
        setSelectedOrder(null);
      }
      
      // Invalidate relevant queries to update UI
      console.log("Invalidating queries for both buyer and seller");
      queryClient.invalidateQueries({ queryKey: ["stakeholder-orders"] });
      
      // Also invalidate specific stakeholder queries to ensure their pages update
      if (result.buyerId) {
        queryClient.invalidateQueries({ queryKey: ["stakeholder-orders", result.buyerId] });
      }
      
      if (result.sellerId) {
        queryClient.invalidateQueries({ queryKey: ["stakeholder-orders", result.sellerId] });
      }

      queryClient.invalidateQueries({ queryKey: ["monthly-dalali"] });
      
      // Show success toast
      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted",
      });
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      
      // Show detailed error message to help debugging
      toast({
        title: "Error Deleting Order",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  const handleBillPaidChange = (orderId: string, billPaid: boolean) => {
    updateOrderBillPaidMutation.mutate({ orderId, billPaid });
  };

  const transformedOrders = orders?.flatMap(order => 
    order.order_items.map(item => ({
      id: item.id,
      order_date: order.order_date,
      buyer: { name: order.buyer.name },
      seller: { name: order.seller.name },
      item: { name: item.item.name },
      buyer_dalali_rate: item.buyer_dalali_rate,
      seller_dalali_rate: item.seller_dalali_rate,
      quantity: item.quantity,
      weight: item.weight,
      dalali_type: item.dalali_type,
      price: item.price
    }))
  ) || [];

  const totalPages = Math.ceil((orders?.length || 0) / itemsPerPage);
  const paginatedOrders = orders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleGenerateInvoice = () => {
    if (!orders?.length) {
      toast({
        title: "No orders found",
        description: "Please select a date range with orders to generate an invoice.",
        variant: "destructive",
      });
      return;
    }
    setShowInvoice(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log("Delete requested for order:", orderId);
    if (orderId) {
      deleteOrderMutation.mutate(orderId);
    } else {
      toast({
        title: "Error",
        description: "Invalid order ID",
        variant: "destructive",
      });
    }
  };

  if (isLoadingStakeholder) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </Layout>
    );
  }

  if (!stakeholder) return null;

  const selectedOrderData = orders?.find((order) => order.id === selectedOrder);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/${stakeholder.type}s`)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Stakeholder Details</h1>
        </div>

        <StakeholderProfileCard stakeholder={stakeholder} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
            <CardTitle>Order History</CardTitle>
            <Button onClick={handleGenerateInvoice} className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </CardHeader>
          <CardContent>
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              handleReset={handleReset}
            />

            {isLoadingOrders ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Dalali Amount (₹)</TableHead>
                        <TableHead>Total Bill Amount (₹)</TableHead>
                        {stakeholder?.type === "buyer" && (
                          <TableHead>Bill Paid</TableHead>
                        )}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{formatDate(order.order_date)}</TableCell>
                          <TableCell>
                            ₹{(stakeholder?.type === "buyer" ? order.buyer_dalali : order.seller_dalali).toFixed(2)}
                          </TableCell>
                          <TableCell>₹{order.total_bill_amount.toFixed(2)}</TableCell>
                          {stakeholder?.type === "buyer" && (
                            <TableCell>
                              <Checkbox 
                                checked={order.bill_paid} 
                                onCheckedChange={(checked) => handleBillPaidChange(order.id, checked as boolean)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <OrderDetailsDialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrderData}
          orderItems={selectedOrderItems || []}
          stakeholderType={stakeholder.type}
          onDeleteOrder={handleDeleteOrder}
        />

        {showInvoice && (
          <InvoiceDialog
            isOpen={showInvoice}
            onClose={() => setShowInvoice(false)}
            orders={transformedOrders}
            stakeholder={stakeholder}
            profile={profile}
            dateRange={{ startDate, endDate }}
          />
        )}
      </div>
    </Layout>
  );
};

export default StakeholderProfile;
