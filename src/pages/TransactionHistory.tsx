import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { startOfDay, endOfDay, format } from "date-fns";
import { Loader2 } from "lucide-react";

const TransactionHistory = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions-history', startDate, endDate],
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
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Transaction History</h1>

      <div className="flex gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <DatePicker date={startDate} onSelect={setStartDate} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <DatePicker date={endDate} onSelect={setEndDate} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {transactions?.map((transaction) => (
            <Card key={transaction.id} className="p-6">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;