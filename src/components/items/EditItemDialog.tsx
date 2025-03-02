
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: number;
  weight: number;
  dalali_type: string;
  buyer_dalali_rate: number;
  seller_dalali_rate: number;
  image_url: string | null;
  category_id: string;
}

interface EditItemDialogProps {
  item: Item | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditItemDialog({ item, onOpenChange, onSuccess }: EditItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const { toast } = useToast();

  // Reset form data when item changes
  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  }, [item]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq('user_id', session.session.user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("items")
        .update({
          name: formData.name,
          price: formData.price,
          weight: formData.weight,
          dalali_type: formData.dalali_type,
          buyer_dalali_rate: formData.buyer_dalali_rate,
          seller_dalali_rate: formData.seller_dalali_rate,
          category_id: formData.category_id,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (Kgs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight || ""}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dalali_type">Dalali Type</Label>
            <Select
              value={formData.dalali_type}
              onValueChange={(value) => setFormData({ ...formData, dalali_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dalali type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Per Quintal">Per Quintal</SelectItem>
                <SelectItem value="% (percentage)">% (percentage)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_rate">Buyer Dalali Rate</Label>
              <Input
                id="buyer_rate"
                type="number"
                step="0.01"
                value={formData.buyer_dalali_rate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, buyer_dalali_rate: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller_rate">Seller Dalali Rate</Label>
              <Input
                id="seller_rate"
                type="number"
                step="0.01"
                value={formData.seller_dalali_rate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, seller_dalali_rate: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {categories?.length ? (
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}