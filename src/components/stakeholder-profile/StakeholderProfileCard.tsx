
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StakeholderProfileCardProps {
  stakeholder: {
    name: string;
    type: string;
    address: string;
    phone_number: string;
  };
}

export const StakeholderProfileCard = ({ stakeholder }: StakeholderProfileCardProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p>{stakeholder.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Type</p>
          <p className="capitalize">{stakeholder.type}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <p>{stakeholder.address}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
          <p>{stakeholder.phone_number}</p>
        </div>
      </CardContent>
    </Card>
  );
};
