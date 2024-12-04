'use client';

import { createClient } from '@/utils/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Printer as PrinterIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Transaction {
  id: number;
  date: string;
  receipt_number: string;
  trucker_name: string;
  plate_number: string;
  time: string;
  unit_volume: string;
  price: number;
  destination: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

interface DailySales {
  date: string;
  total: number;
}

export default function TablePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [truckerName, setTruckerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [unitVolume, setUnitVolume] = useState<string>('');
  const [currentDate, setCurrentDate] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedTrucker, setSelectedTrucker] = useState<string>('all');
  const [uniqueTruckers, setUniqueTruckers] = useState<string[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [uniqueVolumes, setUniqueVolumes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (user?.user_metadata?.trucker_name) {
      setTruckerName(user.user_metadata.trucker_name);
    }
  };

  const fetchTransactions = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    console.log('Transactions from Supabase:', data);

    setTransactions(data || []);
    setFilteredTransactions(data || []);
    calculateDailySales(data || []);
    getUniqueTruckers(data || []);
    getUniqueVolumes(data || []);
  };

  const calculateDailySales = (transactions: Transaction[]) => {
    // Get date range for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Create sales map with 0 as default for all dates
    const salesByDate = last7Days.reduce(
      (acc: { [key: string]: number }, date) => {
        acc[date] = 0;
        return acc;
      },
      {}
    );

    // Add actual sales data only for PAID transactions
    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (
        salesByDate.hasOwnProperty(date) &&
        transaction.payment_status === 'PAID'
      ) {
        salesByDate[date] += transaction.price;
      }
    });

    // Convert to array format for chart
    const dailySalesData = Object.entries(salesByDate).map(([date, total]) => ({
      date: new Date(date).toLocaleDateString(),
      total,
    }));

    setDailySales(dailySalesData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const paymentMethod = formData.get('payment_method') as string;

    const data = {
      date: formData.get('date') as string,
      receipt_number: formData.get('receipt_number') as string,
      trucker_name: formData.get('trucker_name') as string,
      plate_number: formData.get('plate_number') as string,
      time: formData.get('time') as string,
      unit_volume: formData.get('unit_volume') as string,
      price: Number(formData.get('price')),
      destination: formData.get('destination') as string,
      payment_method: paymentMethod,
      payment_status:
        paymentMethod === 'CASH'
          ? 'PAID'
          : (formData.get('payment_status') as string),
    };

    const supabase = createClient();
    const { error } = await supabase.from('transactions').insert([data]);

    if (error) {
      console.error('Error inserting transaction:', error);
      alert('Error creating transaction');
    } else {
      setOpen(false);
      fetchTransactions();
      router.refresh();
    }
    setLoading(false);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const now = new Date();
      setCurrentTime(getCurrentTime());
      setCurrentDate(now.toISOString().split('T')[0]);
    }
    setOpen(open);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    if (value === 'CASH') {
      setPaymentStatus('PAID');
    } else {
      setPaymentStatus('');
    }
  };

  const handleUnitVolumeChange = (value: string) => {
    setUnitVolume(value);
    if (value === '10 cubic meter') {
      setPrice(1650);
    } else if (value === '15 cubic meter') {
      setPrice(2400);
    }
  };

  const getUniqueTruckers = (transactions: Transaction[]) => {
    const truckers = [...new Set(transactions.map((t) => t.trucker_name))];
    setUniqueTruckers(truckers);
  };

  const getUniqueVolumes = (transactions: Transaction[]) => {
    const volumes = [...new Set(transactions.map((t) => t.unit_volume))];
    setUniqueVolumes(volumes);
  };

  const handleDateRangeFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    let filtered = transactions;

    if (start) {
      filtered = filtered.filter((t) => t.date >= start);
    }
    if (end) {
      filtered = filtered.filter((t) => t.date <= end);
    }

    // Apply existing filters
    if (selectedTrucker !== 'all') {
      filtered = filtered.filter((t) => t.trucker_name === selectedTrucker);
    }
    if (selectedVolume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === selectedVolume);
    }

    setFilteredTransactions(filtered);
  };

  const handleTruckerFilter = (truckerName: string) => {
    setSelectedTrucker(truckerName);
    let filtered = transactions;

    if (truckerName !== 'all') {
      filtered = filtered.filter((t) => t.trucker_name === truckerName);
    }
    if (selectedVolume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === selectedVolume);
    }
    if (startDate) {
      filtered = filtered.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const handleVolumeFilter = (volume: string) => {
    setSelectedVolume(volume);
    let filtered = transactions;

    if (volume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === volume);
    }
    if (selectedTrucker !== 'all') {
      filtered = filtered.filter((t) => t.trucker_name === selectedTrucker);
    }
    if (startDate) {
      filtered = filtered.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const handlePrint = () => {
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.set('startDate', startDate);
    if (endDate) queryParams.set('endDate', endDate);
    if (selectedTrucker) queryParams.set('trucker', selectedTrucker);
    if (selectedVolume) queryParams.set('volume', selectedVolume);

    const printUrl = `/dashboard/records/print?${queryParams.toString()}`;
    window.open(printUrl, '_blank');
  };

  const handleUpdatePaymentStatus = async (transactionId: number) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('transactions')
      .update({ payment_status: 'PAID' })
      .eq('id', transactionId);

    if (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    } else {
      fetchTransactions();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>A list of all your transactions</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>New Transaction</DialogTitle>
                <DialogDescription>
                  Create a new transaction record
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      type="time"
                      id="time"
                      name="time"
                      value={currentTime}
                      onChange={(e) => setCurrentTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt_number">Receipt Number</Label>
                    <Input id="receipt_number" name="receipt_number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trucker_name">Trucker Name</Label>
                    <Input
                      id="trucker_name"
                      name="trucker_name"
                      value={truckerName}
                      readOnly
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate_number">Plate Number</Label>
                    <Input id="plate_number" name="plate_number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_volume">Unit Volume</Label>
                    <Select
                      name="unit_volume"
                      value={unitVolume}
                      onValueChange={handleUnitVolumeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10 cubic meter">
                          10 cubic meter
                        </SelectItem>
                        <SelectItem value="15 cubic meter">
                          15 cubic meter
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="price"
                      name="price"
                      value={price}
                      readOnly
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" name="destination" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      name="payment_method"
                      value={paymentMethod}
                      onValueChange={handlePaymentMethodChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="PO">PO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      name="payment_status"
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                      required
                      disabled={paymentMethod === 'CASH'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Transaction'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">
              Daily Sales (Last 7 Days)
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    // angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `₱${value.toLocaleString()}`,
                      'Total Sales',
                    ]}
                  />
                  <Bar dataKey="total" fill="#4f46e5" name="Total Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-md border overflow-auto max-h-[600px]">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="startDate">From:</Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) =>
                        handleDateRangeFilter(e.target.value, endDate)
                      }
                      className="w-[160px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="endDate">To:</Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) =>
                        handleDateRangeFilter(startDate, e.target.value)
                      }
                      className="w-[160px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="truckerFilter">Filter by Trucker:</Label>
                    <Select
                      value={selectedTrucker}
                      onValueChange={handleTruckerFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select trucker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Truckers</SelectItem>
                        {uniqueTruckers.map((trucker) => (
                          <SelectItem key={trucker} value={trucker}>
                            {trucker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="volumeFilter">Filter by Volume:</Label>
                    <Select
                      value={selectedVolume}
                      onValueChange={handleVolumeFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Volumes</SelectItem>
                        {uniqueVolumes.map((volume) => (
                          <SelectItem key={volume} value={volume}>
                            {volume}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handlePrint}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print Filtered Results
                  </Button>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Trucker Name</TableHead>
                  <TableHead>Plate #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Unit Volume</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.receipt_number}</TableCell>
                    <TableCell>{transaction.trucker_name}</TableCell>
                    <TableCell>{transaction.plate_number}</TableCell>
                    <TableCell>{transaction.time}</TableCell>
                    <TableCell className="text-right">
                      {transaction.unit_volume}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(transaction.price)}
                    </TableCell>
                    <TableCell>{transaction.destination}</TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            transaction.payment_status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.payment_status}
                        </span>
                        {transaction.payment_status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdatePaymentStatus(transaction.id)
                            }
                            className="h-7 text-xs"
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </div>
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
