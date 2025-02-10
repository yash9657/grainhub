import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Item {
  id: string;
  name: string;
  price: number;
  weight: number;
  dalali_type: string;
  buyer_dalali_rate: number;
  seller_dalali_rate: number;
  image_url: string | null;
  categories: {
    name: string;
  };
}

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
}

export function ItemsTable({ items, isLoading }: ItemsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Weight (Kgs)</TableHead>
            <TableHead>Dalali Type</TableHead>
            <TableHead>Buyer Rate</TableHead>
            <TableHead>Seller Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded-md" />
                  )}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.categories.name}</TableCell>
                <TableCell>₹{item.price.toFixed(2)}</TableCell>
                <TableCell>{item.weight}</TableCell>
                <TableCell>{item.dalali_type}</TableCell>
                <TableCell>{item.buyer_dalali_rate}</TableCell>
                <TableCell>{item.seller_dalali_rate}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}