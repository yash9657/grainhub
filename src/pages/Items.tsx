
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddItemDialog } from "@/components/items/AddItemDialog";
import { ItemsTable } from "@/components/items/ItemsTable";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

const Items = () => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ["items", debouncedSearch],
    queryFn: async () => {
      const query = supabase
        .from("items")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (debouncedSearch) {
        query.ilike("name", `%${debouncedSearch}%`);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Items</h1>
          <Button onClick={() => setIsAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        <ItemsTable 
          items={items || []} 
          isLoading={isLoading} 
          onItemUpdated={refetch}
        />

        <AddItemDialog
          open={isAddItemOpen}
          onOpenChange={setIsAddItemOpen}
          onSuccess={() => {
            refetch();
            setIsAddItemOpen(false);
          }}
        />
      </div>
    </Layout>
  );
};

export default Items;