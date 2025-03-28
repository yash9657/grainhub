
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  orderItems: any[];
  stakeholderType: string;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderDetailsDialog = ({
  isOpen,
  onClose,
  order,
  orderItems,
  stakeholderType,
  onDeleteOrder,
}: OrderDetailsDialogProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (order && onDeleteOrder) {
      try {
        onDeleteOrder(order.id);
        // Note: We don't show a toast here because the parent component will handle this
        // through the mutation's onSuccess callback
      } catch (error) {
        console.error("Error in handleDeleteConfirm:", error);
        // If there's an immediate error (unlikely), catch it here
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
      setShowDeleteConfirmation(false);
    }
  }

  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {order.order_date && `Order details for ${formatDate(order.order_date)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center" 
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </Button>
          </div>

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

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone and will permanently
              remove the order and all its items from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
