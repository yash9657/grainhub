import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    address: "",
    pan_number: "",
    mobile_number: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          company_name: data.company_name || "",
          address: data.address || "",
          pan_number: data.pan_number || "",
          mobile_number: data.mobile_number || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user?.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="mt-1">{profile.company_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="mt-1">{profile.address || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                  <p className="mt-1">{profile.pan_number || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <p className="mt-1">{profile.mobile_number || "Not set"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    type="text"
                    value={profile.company_name}
                    onChange={(e) =>
                      setProfile({ ...profile, company_name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium">
                    Address
                  </label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="pan_number" className="block text-sm font-medium">
                    PAN Number
                  </label>
                  <Input
                    id="pan_number"
                    type="text"
                    value={profile.pan_number}
                    onChange={(e) =>
                      setProfile({ ...profile, pan_number: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="mobile_number" className="block text-sm font-medium">
                    Mobile Number
                  </label>
                  <Input
                    id="mobile_number"
                    type="tel"
                    value={profile.mobile_number}
                    onChange={(e) =>
                      setProfile({ ...profile, mobile_number: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;