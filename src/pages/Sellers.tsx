
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StakeholdersTable } from "@/components/stakeholders/StakeholdersTable";
import { AddStakeholderDialog } from "@/components/stakeholders/AddStakeholderDialog";
import Layout from "@/components/Layout";

const Sellers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ["sellers"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error("No user found");

      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("user_id", session.session.user.id)
        .eq("type", "seller")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const totalPages = Math.ceil((sellers?.length || 0) / itemsPerPage);
  const paginatedSellers = sellers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sellers</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Seller
          </Button>
        </div>

        <StakeholdersTable
          stakeholders={paginatedSellers || []}
          isLoading={isLoading}
          type="seller"
        />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <AddStakeholderDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={() => {
            setIsAddDialogOpen(false);
            refetch();
          }}
          type="seller"
        />
      </div>
    </Layout>
  );
};

export default Sellers;
