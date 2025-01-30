import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-8">Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Card key={service.id} className="p-6">
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.categories?.name}</p>
            <p className="text-lg font-bold mt-2">${service.price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;