import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface ServiceItem {
  id: string;
  category: string;
  service: string;
  serviceId: string;
  price: number;
  tip: number;
  staff: string;
}

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  category_id: string;
}

interface Staff {
  id: string;
  full_name: string | null;
  email: string;
}

const NewSale = () => {
  const [selectedItems, setSelectedItems] = useState<ServiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch services from Supabase
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Service[];
    }
  });

  // Updated staff query to fetch all staff profiles
  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'staff');

      if (error) {
        console.error('Error fetching staff:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load staff members. Please try again.",
        });
        return [];
      }
      return data;
    }
  });

  const addNewItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      category: '',
      service: '',
      serviceId: '',
      price: 0,
      tip: 0,
      staff: '',
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const updateItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = [...selectedItems];
    const item = { ...updatedItems[index] };

    if (field === 'category') {
      item.category = value as string;
      item.service = '';
      item.serviceId = '';
      item.price = 0;
    } else if (field === 'service') {
      const selectedService = services.find(s => s.id === value);
      if (selectedService) {
        item.service = selectedService.name;
        item.serviceId = selectedService.id;
        item.price = selectedService.price;
      }
    } else if (field === 'price') {
      item.price = Number(value);
    } else {
      (item[field] as string | number) = value;
    }

    updatedItems[index] = item;
    setSelectedItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + Number(item.price) + (item.tip || 0), 0);
  };

  const handleSubmit = async () => {
    if (!customerName || !customerMobile || selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          customer_name: customerName,
          customer_mobile: customerMobile,
          total_amount: calculateTotal(),
          total_tips: selectedItems.reduce((sum, item) => sum + (item.tip || 0), 0),
          created_by: user?.id
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(
          selectedItems.map(item => ({
            transaction_id: transaction.id,
            service_id: item.serviceId,
            staff_id: item.staff,
            price: item.price,
            tip: item.tip || 0
          }))
        );

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Sale completed successfully!",
      });

      // Reset form
      setSelectedItems([]);
      setCustomerName('');
      setCustomerMobile('');
    } catch (error) {
      console.error('Failed to complete sale:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete sale. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-semibold mb-8">New Sale</h1>
      
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Customer Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <Input
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          {selectedItems.map((item, index) => (
            <div key={item.id} className="flex gap-4 items-start p-4 bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-6 gap-4 flex-1">
                <div className="col-span-1">
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateItem(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Select
                    value={item.serviceId}
                    onValueChange={(value) => updateItem(index, 'service', value)}
                    disabled={!item.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services
                        .filter(service => service.category_id === item.category)
                        .map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Select
                    value={item.staff}
                    onValueChange={(value) => updateItem(index, 'staff', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name || s.email}
                        </SelectItem>
                      ))}
                      {staff.length === 0 && (
                        <SelectItem value="none" disabled>
                          No staff members available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Input
                    type="number"
                    placeholder="Tip"
                    value={item.tip || ''}
                    onChange={(e) => updateItem(index, 'tip', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 flex items-center justify-between">
                  <span className="font-medium">${Number(item.price) + (item.tip || 0)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={addNewItem}
            variant="outline"
            className="w-full mt-4 border-dashed border-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-primary text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg">Total Amount</p>
            <p className="text-3xl font-bold">${calculateTotal().toFixed(2)}</p>
          </div>
          <Button
            onClick={handleSubmit}
            className="bg-white text-primary hover:bg-gray-100"
            disabled={selectedItems.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewSale;
