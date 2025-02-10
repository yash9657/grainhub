
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  orderItems: any[];
  stakeholderType: string;
}

export const OrderDetailsDialog = ({
  isOpen,
  onClose,
  order,
  orderItems,
  stakeholderType,
}: OrderDetailsDialogProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            {order.order_date && `Order details for ${formatDate(order.order_date)}`}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p>{formatDate(order.order_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dalali Amount</p>
              <p>₹{(stakeholderType === "buyer" ? order.buyer_dalali : order.seller_dalali).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bill Amount</p>
              <p>₹{order.total_bill_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stakeholderType === "buyer" ? "Seller" : "Buyer"}
              </p>
              <p>
                {stakeholderType === "buyer"
                  ? order.seller.name
                  : order.buyer.name}
              </p>
            </div>
            {order.note && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Note</p>
                <p className="text-sm mt-1">{order.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price (₹/kg)</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buyer Rate</TableHead>
                <TableHead>Seller Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.item.name}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.buyer_dalali_rate}</TableCell>
                  <TableCell>{item.seller_dalali_rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
