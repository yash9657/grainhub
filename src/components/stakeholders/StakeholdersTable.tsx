
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  address: string;
  phone_number: string;
}

interface StakeholdersTableProps {
  stakeholders: Stakeholder[];
  isLoading: boolean;
  type: "buyer" | "seller";
}

export function StakeholdersTable({ stakeholders, isLoading, type }: StakeholdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStakeholders = stakeholders.filter((stakeholder) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      stakeholder.name.toLowerCase().includes(searchLower) ||
      stakeholder.address.toLowerCase().includes(searchLower) ||
      stakeholder.phone_number.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, address, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStakeholders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  {searchQuery ? "No results found" : `No ${type}s found`}
                </TableCell>
              </TableRow>
            ) : (
              filteredStakeholders.map((stakeholder) => (
                <TableRow key={stakeholder.id}>
                  <TableCell>
                    <Link
                      to={`/${type}s/${stakeholder.id}`}
                      className="text-primary hover:underline"
                    >
                      {stakeholder.name}
                    </Link>
                  </TableCell>
                  <TableCell>{stakeholder.address}</TableCell>
                  <TableCell>{stakeholder.phone_number}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
