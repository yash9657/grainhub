
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrderItemWithDetails {
  id: string;
  order_date: string;
  buyer: { name: string };
  seller: { name: string };
  item: { name: string };
  buyer_dalali_rate: number;
  seller_dalali_rate: number;
  quantity: number;
  weight: number;
  dalali_type: string;
  price: number;
}

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItemWithDetails[];
  stakeholder: {
    type: string;
    name: string;
  };
  profile: {
    company_name: string | null;
    address: string | null;
    pan_number: string | null;
    mobile_number: string | null;
  } | null;
  dateRange: {
    startDate?: Date;
    endDate?: Date;
  };
}

export const InvoiceDialog = ({
  isOpen,
  onClose,
  orders,
  stakeholder,
  profile,
  dateRange,
}: InvoiceDialogProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${stakeholder.name}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const calculateItemDalali = (order: OrderItemWithDetails) => {
    const rate = stakeholder.type === "buyer" ? order.buyer_dalali_rate : order.seller_dalali_rate;

    if (order.dalali_type === "%") {
      const amount = order.price * order.weight * order.quantity;
      return (rate / 100) * amount;
    } else {
      // Per Quintal calculation
      return ((order.quantity * order.weight) / 100) * rate;
    }
  };

  const totalCommission = orders.reduce((sum, order) => sum + calculateItemDalali(order), 0);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? "w-[95vw] p-4" : "max-w-4xl"} max-h-[90vh] overflow-y-auto`}>
        <div ref={invoiceRef} className="bg-white p-4 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Commission Invoice</h1>
            <p className="text-sm text-gray-600 mb-2">For: {stakeholder.name}</p>
            <p className="text-sm text-gray-600">
              Period: {dateRange.startDate ? format(dateRange.startDate, "PPP") : "Start"} -{" "}
              {dateRange.endDate ? format(dateRange.endDate, "PPP") : "End"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="font-semibold mb-2">From:</h2>
              <p>{profile?.company_name || stakeholder.name}</p>
              <p className="text-sm text-gray-600">{profile?.address}</p>
              {profile?.pan_number && (
                <p className="text-sm text-gray-600">PAN: {profile.pan_number}</p>
              )}
              {profile?.mobile_number && (
                <p className="text-sm text-gray-600">Mobile: {profile.mobile_number}</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto mb-6 md:mb-8">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Date</th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">
                    {stakeholder.type === "buyer" ? "Seller" : "Buyer"}
                  </th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Item</th>
                  <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Rate</th>
                  <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Quantity</th>
                  <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Commission (₹)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">{formatDate(order.order_date)}</td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">
                      {stakeholder.type === "buyer" ? order.seller.name : order.buyer.name}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">{order.item.name}</td>
                    <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                      {stakeholder.type === "buyer" ? order.buyer_dalali_rate : order.seller_dalali_rate}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                      {order.quantity}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                      ₹{calculateItemDalali(order).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={5} className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                    Grand Total:
                  </td>
                  <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">₹{totalCommission.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleDownloadPDF} className="w-full md:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
