import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart, IndianRupee, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth } from "date-fns";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch monthly dalali statistics
  const { data: monthlyDalali, isLoading: isDalaliLoading } = useQuery({
    queryKey: ["monthly-dalali"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date()).toISOString();
      const endDate = endOfMonth(new Date()).toISOString();
  
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");
  
      const { data, error } = await supabase
        .from("orders")
        .select("buyer_dalali, seller_dalali")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .eq("user_id", session.session.user.id);
  
      if (error) {
        toast({
          title: "Error fetching dalali statistics",
          description: error.message,
          variant: "destructive",
        });
        return { buyerDalali: 0, sellerDalali: 0 };
      }
  
      const totals = data.reduce(
        (acc, order) => ({
          buyerDalali: acc.buyerDalali + Number(order.buyer_dalali || 0),
          sellerDalali: acc.sellerDalali + Number(order.seller_dalali || 0),
        }),
        { buyerDalali: 0, sellerDalali: 0 }
      );
  
      return totals;
    },
    staleTime: 300000, // Data is fresh for 5 minutes
    gcTime: 600000, // Data stays in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 3,
  });
  

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
  });

  // Fetch cart items count - updated to count unique items
  const { data: cartItemsCount } = useQuery({
    queryKey: ["cart-items-count"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", session.session.user.id);

      if (error) throw error;

      return data.length; // Return count of unique items instead of sum of quantities
    },
  });

  // Fetch items with category filter and search
  const { data: items, isLoading } = useQuery({
    queryKey: ["dashboard-items", debouncedSearch, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("items")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (debouncedSearch) {
        query = query.ilike("name", `%${debouncedSearch}%`);
      }

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error fetching items",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data: existingCartItem, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("item_id", itemId)
        .eq("user_id", session.session.user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingCartItem) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq("id", existingCartItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            item_id: itemId,
            user_id: session.session.user.id,
            quantity: 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      queryClient.invalidateQueries({ queryKey: ["cart-items-count"] });
      toast({
        title: "Success",
        description: "Item added to cart",
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => navigate("/cart")} variant="outline" className="relative">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Button>
        </div>

        {/* Monthly Dalali Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Buyer Dalali</h3>
                <IndianRupee className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {isDalaliLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ₹{monthlyDalali?.buyerDalali.toFixed(2) || "0.00"}
                  </span>
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">this month</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Seller Dalali</h3>
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              {isDalaliLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                    ₹{monthlyDalali?.sellerDalali.toFixed(2) || "0.00"}
                  </span>
                  <span className="ml-2 text-sm text-green-600 dark:text-green-400">this month</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select
            value={selectedCategory || undefined}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            : items?.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>₹{item.price}</span>
                      <span>{item.weight} kg</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {item.categories?.name}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => addToCartMutation.mutate(item.id)}
                      disabled={addToCartMutation.isPending}
                    >
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Empty State */}
        {!isLoading && (!items || items.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
