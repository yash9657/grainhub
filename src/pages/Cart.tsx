
import { useState, useRef, useEffect } from "react";
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
import { useDebounceFn } from "@/hooks/use-debounce";

interface CartItem {
  id: string;
  quantity: number;
  price: number;
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
  const [localItemValues, setLocalItemValues] = useState<Record<string, { price: string; quantity: string }>>({});
  const inputRefs = useRef<Record<string, { price: HTMLInputElement | null; quantity: HTMLInputElement | null }>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ price })
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

  const debouncedUpdateQuantity = useDebounceFn((id: string, quantity: number) => {
    updateQuantityMutation.mutate({ id, quantity });
  }, 800);

  const debouncedUpdatePrice = useDebounceFn((id: string, price: number) => {
    updatePriceMutation.mutate({ id, price });
  }, 800);

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
          price,
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
      
      const items = (data || []).map(item => ({
        ...item,
        price: item.price || item.item.price
      })) as CartItem[];
      
      const newLocalValues: Record<string, { price: string; quantity: string }> = {};
      items.forEach(item => {
        newLocalValues[item.id] = {
          price: item.price.toFixed(2),
          quantity: item.quantity.toString()
        };
      });
      
      setLocalItemValues(prev => {
        const merged = {...prev};
        
        Object.keys(newLocalValues).forEach(id => {
          const priceInput = inputRefs.current[id]?.price;
          const quantityInput = inputRefs.current[id]?.quantity;
          
          if (!priceInput?.matches(':focus')) {
            merged[id] = merged[id] || { price: "0.00", quantity: "1" };
            merged[id].price = newLocalValues[id].price;
          }
          
          if (!quantityInput?.matches(':focus')) {
            merged[id] = merged[id] || { price: "0.00", quantity: "1" };
            merged[id].quantity = newLocalValues[id].quantity;
          }
        });
        
        return merged;
      });
      
      return items;
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
    const price = cartItem.price;
    const amount = price * item.weight * quantity;

    if (item.dalali_type === "%") {
      return (rate / 100) * amount;
    } else {
      return (rate * item.weight * quantity) / 100;
    }
  };

  const calculateTotals = () => {
    if (!cartItems) return { total: 0, buyerDalali: 0, sellerDalali: 0 };

    return cartItems.reduce(
      (acc, item) => ({
        total: acc.total + item.price * item.item.weight * item.quantity,
        buyerDalali: acc.buyerDalali + calculateItemDalali(item, "buyer"),
        sellerDalali: acc.sellerDalali + calculateItemDalali(item, "seller"),
      }),
      { total: 0, buyerDalali: 0, sellerDalali: 0 }
    );
  };

  const totals = calculateTotals();

  const handleInputChange = (id: string, field: 'price' | 'quantity', value: string) => {
    let isValid = false;
    let formattedValue = value;
    
    if (field === 'price') {
      isValid = /^\d*\.?\d{0,2}$/.test(value);
      if (value === '') formattedValue = '0.00';
    } else {
      // Allow empty string by matching 0 or more digits.
      isValid = /^\d*$/.test(value);
      // Do not force the empty string to "1" here.
    }
    
    if (isValid) {
      setLocalItemValues(prev => {
        const newValues = { ...prev };
        if (!newValues[id]) {
          // Initialize with default values if not set.
          newValues[id] = { price: "0.00", quantity: "1" };
        }
        newValues[id][field] = formattedValue;
        return newValues;
      });
  
      // Only update backend if the field is not empty.
      const numValue = parseFloat(formattedValue || '0');
      if (field === 'price' && numValue > 0) {
        debouncedUpdatePrice(id, numValue);
      } else if (field === 'quantity' && formattedValue !== '' && numValue > 0) {
        debouncedUpdateQuantity(id, numValue);
      }
    }
  };
  

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
                    <TableCell>
                      <Input
                        ref={el => {
                          if (!inputRefs.current[item.id]) inputRefs.current[item.id] = { price: null, quantity: null };
                          inputRefs.current[item.id].price = el;
                        }}
                        type="text"
                        value={localItemValues[item.id]?.price || item.price.toFixed(2)}
                        onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{item.item.weight}</TableCell>
                    <TableCell>
                      <Input
                        ref={el => {
                          if (!inputRefs.current[item.id]) {
                            inputRefs.current[item.id] = { price: null, quantity: null };
                          }
                          inputRefs.current[item.id].quantity = el;
                        }}
                        type="text"
                        // Use a ternary to check if the local value exists (even if empty string) rather than using || which treats '' as falsy.
                        value={localItemValues[item.id] !== undefined ? localItemValues[item.id].quantity : item.quantity.toString()}
                        onChange={(e) => handleInputChange(item.id, 'quantity', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            // On blur, if the field is empty, reset it to "1".
                            handleInputChange(item.id, 'quantity', '1');
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