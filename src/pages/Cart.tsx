import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDialog } from "@/components/orders/OrderDialog";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    price: number;
    weight: number;
    dalali_type: string;
    buyer_dalali_rate: number;
    seller_dalali_rate: number;
  };
}

const Cart = () => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart-items"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          item:items (
            id,
            name,
            price,
            weight,
            dalali_type,
            buyer_dalali_rate,
            seller_dalali_rate
          )
        `)
        .eq("user_id", session.session.user.id);

      if (error) throw error;
      return data as CartItem[];
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateItemDalali = (cartItem: CartItem, type: "buyer" | "seller") => {
    const { item, quantity } = cartItem;
    const rate = type === "buyer" ? item.buyer_dalali_rate : item.seller_dalali_rate;
    const amount = item.price * item.weight * quantity;

    if (item.dalali_type === "%") {
      return (rate / 100) * amount;
    } else {
      // Per Quintal calculation
      return (rate * item.weight * quantity) / 100;
    }
  };

  const calculateTotals = () => {
    if (!cartItems) return { total: 0, buyerDalali: 0, sellerDalali: 0 };

    return cartItems.reduce(
      (acc, item) => ({
        total: acc.total + item.item.price * item.item.weight * item.quantity,
        buyerDalali: acc.buyerDalali + calculateItemDalali(item, "buyer"),
        sellerDalali: acc.sellerDalali + calculateItemDalali(item, "seller"),
      }),
      { total: 0, buyerDalali: 0, sellerDalali: 0 }
    );
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Cart</h1>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price (₹/kg)</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!cartItems || cartItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Your cart is empty
                  </TableCell>
                </TableRow>
              ) : (
                cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item.name}</TableCell>
                    <TableCell>₹{item.item.price}</TableCell>
                    <TableCell>{item.item.weight}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value);
                          if (quantity > 0) {
                            updateQuantityMutation.mutate({
                              id: item.id,
                              quantity,
                            });
                          }
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemMutation.mutate(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {cartItems && cartItems.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buyer Dalali:</span>
                  <span>₹{totals.buyerDalali.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seller Dalali:</span>
                  <span>₹{totals.sellerDalali.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={() => setIsOrderDialogOpen(true)}
              >
                Generate Order
              </Button>
            </div>

            <OrderDialog
              open={isOrderDialogOpen}
              onOpenChange={setIsOrderDialogOpen}
              cartItems={cartItems}
              totals={totals}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
