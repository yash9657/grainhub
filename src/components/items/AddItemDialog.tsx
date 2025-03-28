import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    weight: "",
    dalali_type: "",
    buyer_dalali_rate: "",
    seller_dalali_rate: "",
  });

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
    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) {
        throw new Error("No user found");
      }

      let categoryId = selectedCategory;

      // If new category is entered, create it first
      if (newCategory && !selectedCategory) {
        const { data: newCategoryData, error: categoryError } = await supabase
          .from("categories")
          .insert({ 
            name: newCategory,
            user_id: session.session.user.id 
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        categoryId = newCategoryData.id;

        // Invalidate the categories query to refetch updated categories
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("item_images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("item_images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: itemError } = await supabase.from("items").insert({
        name: formData.name,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        dalali_type: formData.dalali_type,
        buyer_dalali_rate: parseFloat(formData.buyer_dalali_rate),
        seller_dalali_rate: parseFloat(formData.seller_dalali_rate),
        category_id: categoryId,
        image_url: imageUrl,
        user_id: session.session.user.id
      });

      if (itemError) throw itemError;

      toast({
        title: "Success",
        description: "Item added successfully",
      });

      onSuccess();
      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      weight: "",
      dalali_type: "",
      buyer_dalali_rate: "",
      seller_dalali_rate: "",
    });
    setNewCategory("");
    setSelectedCategory("");
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (Kgs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                value={formData.buyer_dalali_rate}
                onChange={(e) => setFormData({ ...formData, buyer_dalali_rate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller_rate">Seller Dalali Rate</Label>
              <Input
                id="seller_rate"
                type="number"
                step="0.01"
                value={formData.seller_dalali_rate}
                onChange={(e) => setFormData({ ...formData, seller_dalali_rate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {categories?.length ? (
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter new category" />
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
            {!selectedCategory && (
              <Input
                placeholder="Enter new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}