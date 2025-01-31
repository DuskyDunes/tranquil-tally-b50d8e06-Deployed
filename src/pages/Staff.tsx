import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Staff = () => {
  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Staff</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staffMembers?.map((staff) => (
          <Card key={staff.id} className="p-6">
            <h3 className="text-lg font-semibold">{staff.full_name}</h3>
            <p className="text-sm text-gray-500">{staff.email}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Staff;