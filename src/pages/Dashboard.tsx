import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: totalSales } = useQuery({
    queryKey: ['total-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('total_amount')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
      if (error) throw error;
      return data.reduce((sum, transaction) => sum + Number(transaction.total_amount), 0);
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-600">Today's Sales</h3>
          <p className="text-3xl font-bold mt-2">${totalSales?.toFixed(2) || '0.00'}</p>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {isLoadingTransactions ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {recentTransactions?.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.customer_name}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                  </div>
                  <p className="font-bold">${transaction.total_amount}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;