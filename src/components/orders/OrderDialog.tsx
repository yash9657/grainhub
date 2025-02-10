
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: Array<{
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
  }>;
  totals: {
    total: number;
    buyerDalali: number;
    sellerDalali: number;
  };
}

const formSchema = z.object({
  buyer_id: z.string(),
  seller_id: z.string(),
  order_date: z.date(),
  note: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OrderDialog({ open, onOpenChange, cartItems, totals }: OrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_date: new Date(),
    },
  });

  const { data: stakeholders } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("user_id", session.session.user.id);

      if (error) throw error;
      return data;
    },
  });

  const buyers = stakeholders?.filter((s) => s.type === "buyer") || [];
  const sellers = stakeholders?.filter((s) => s.type === "seller") || [];

  const calculateItemDalali = (cartItem: OrderDialogProps["cartItems"][0], type: "buyer" | "seller") => {
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

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      // Calculate totals again to ensure accuracy
      const totalBuyerDalali = cartItems.reduce((sum, item) => 
        sum + calculateItemDalali(item, "buyer"), 0
      );

      const totalSellerDalali = cartItems.reduce((sum, item) => 
        sum + calculateItemDalali(item, "seller"), 0
      );

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: values.buyer_id,
          seller_id: values.seller_id,
          order_date: values.order_date.toISOString(),
          note: values.note,
          user_id: session.session.user.id,
          dalali_amount: totalBuyerDalali + totalSellerDalali,
          total_bill_amount: totals.total,
          buyer_dalali: totalBuyerDalali,
          seller_dalali: totalSellerDalali,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with normalized dalali_type
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        item_id: item.item.id,
        quantity: item.quantity,
        price: item.item.price,
        weight: item.item.weight,
        dalali_type: item.item.dalali_type === "Per Quintal" ? "Q" : "%", // Normalize to ensure only valid values
        buyer_dalali_rate: item.item.buyer_dalali_rate,
        seller_dalali_rate: item.item.seller_dalali_rate,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", session.session.user.id);

      if (clearCartError) throw clearCartError;

      // Success
      toast({
        title: "Success",
        description: "Order created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      onOpenChange(false);
      navigate(`/buyers/${values.buyer_id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Order</DialogTitle>
          <DialogDescription>
            Please fill out the order details to generate a new order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="buyer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id}>
                          {buyer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seller_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seller" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Order Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Order
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
