import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const TransactionDetail = () => {
  const { id } = useParams();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            services (
              name
            ),
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Transaction Details</h1>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{transaction.customer_name}</h3>
            <p className="text-sm text-gray-500">{transaction.customer_mobile}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(transaction.created_at), 'PPpp')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">${transaction.total_amount}</p>
            <p className="text-sm text-gray-500">Tips: ${transaction.total_tips}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Services</h4>
          <div className="space-y-2">
            {transaction.transaction_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p>{item.services?.name}</p>
                  <p className="text-sm text-gray-500">
                    Staff: {item.profiles?.full_name || item.profiles?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p>${item.price}</p>
                  {item.tip > 0 && (
                    <p className="text-sm text-gray-500">Tip: ${item.tip}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransactionDetail;