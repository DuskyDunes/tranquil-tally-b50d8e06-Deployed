import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Services = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            name
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  // Group services by category
  const servicesByCategory = services?.reduce((acc, service) => {
    const categoryName = service.categories?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Services</h1>
      
      {Object.entries(servicesByCategory || {}).map(([category, services]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services?.map((service) => (
              <Card key={service.id} className="p-6">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <p className="text-lg font-bold mt-2">${service.price}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Services;