import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Transaction {
  id: number;
  date: string;
  receipt_number: string;
  trucker_name: string;
  plate_number: string;
  time: string;
  quantity: number;
  price: number;
  destination: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export default async function CashRecordsPage() {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_method', 'CASH')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return <div>Error loading transactions</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cash Transactions</CardTitle>
          <CardDescription>A list of all cash transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Trucker Name</TableHead>
                  <TableHead>Plate #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.receipt_number}</TableCell>
                    <TableCell>{transaction.trucker_name}</TableCell>
                    <TableCell>{transaction.plate_number}</TableCell>
                    <TableCell>{transaction.time}</TableCell>
                    <TableCell className="text-right">
                      {transaction.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(transaction.price)}
                    </TableCell>
                    <TableCell>{transaction.destination}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {transaction.payment_method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.payment_status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
