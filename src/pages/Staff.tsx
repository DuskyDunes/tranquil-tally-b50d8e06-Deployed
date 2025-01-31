import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

const Staff = () => {
  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');
      
      if (error) {
        console.error('Error fetching staff:', error);
        throw error;
      }
      return data as StaffMember[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Staff Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staffMembers?.map((staff) => (
          <Card key={staff.id} className="p-6">
            <h3 className="text-lg font-semibold">
              {staff.full_name || 'No name set'}
            </h3>
            <p className="text-sm text-gray-500">{staff.email}</p>
            <p className="text-sm text-gray-500 mt-2 capitalize">{staff.role}</p>
          </Card>
        ))}
        {staffMembers?.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-8">
            No staff members found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Staff;