import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface ServiceItem {
  id: string;
  category: string;
  service: string;
  price: number;
  tip: number;
  staff: string;
}

const categories = [
  { id: 'massage', name: 'Massage' },
  { id: 'facial', name: 'Facial' },
  { id: 'nails', name: 'Nails' },
  { id: 'hair', name: 'Hair' },
];

const services = {
  massage: [
    { id: 'm1', name: 'Swedish Massage', price: 80 },
    { id: 'm2', name: 'Deep Tissue Massage', price: 100 },
    { id: 'm3', name: 'Hot Stone Massage', price: 120 },
  ],
  facial: [
    { id: 'f1', name: 'Classic Facial', price: 70 },
    { id: 'f2', name: 'Anti-Aging Facial', price: 90 },
    { id: 'f3', name: 'Hydrating Facial', price: 85 },
  ],
  nails: [
    { id: 'n1', name: 'Manicure', price: 35 },
    { id: 'n2', name: 'Pedicure', price: 45 },
    { id: 'n3', name: 'Gel Polish', price: 50 },
  ],
  hair: [
    { id: 'h1', name: 'Haircut', price: 60 },
    { id: 'h2', name: 'Color', price: 120 },
    { id: 'h3', name: 'Highlights', price: 150 },
  ],
};

const staff = [
  { id: 's1', name: 'Sarah Johnson' },
  { id: 's2', name: 'Michael Chen' },
  { id: 's3', name: 'Emma Davis' },
  { id: 's4', name: 'James Wilson' },
];

const NewSale = () => {
  const [selectedItems, setSelectedItems] = useState<ServiceItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');

  const addNewItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      category: '',
      service: '',
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
      item.price = 0;
    } else if (field === 'service') {
      const selectedService = services[item.category as keyof typeof services].find(
        (s) => s.id === value
      );
      if (selectedService) {
        item.service = selectedService.name;
        item.price = selectedService.price;
      }
    } else {
      item[field] = value;
    }

    updatedItems[index] = item;
    setSelectedItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.price + (item.tip || 0), 0);
  };

  const handleSubmit = () => {
    console.log('Sale completed:', selectedItems);
    // Here you would typically send this data to your backend
    setSelectedItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-semibold mb-8">New Sale</h1>
      
      <Card className="p-6 mb-6">
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

                <div className="col-span-2">
                  <Select
                    value={item.service}
                    onValueChange={(value) => updateItem(index, 'service', value)}
                    disabled={!item.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {item.category &&
                        services[item.category as keyof typeof services].map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                          {s.name}
                        </SelectItem>
                      ))}
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
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 flex items-center justify-between">
                  <span className="font-medium">${item.price + (item.tip || 0)}</span>
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