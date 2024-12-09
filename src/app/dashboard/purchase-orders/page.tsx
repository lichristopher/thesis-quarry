'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function PurchaseOrdersPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTrucker, setSelectedTrucker] = useState<string>('all');
  const [uniqueVolumes, setUniqueVolumes] = useState<string[]>([]);
  const [uniqueTruckers, setUniqueTruckers] = useState<string[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_method', 'PO')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(data || []);
    setFilteredTransactions(data || []);
    getUniqueVolumes(data || []);
    getUniqueTruckers(data || []);
  };

  const getUniqueVolumes = (transactions: Transaction[]) => {
    const volumes = [...new Set(transactions.map((t) => t.unit_volume))];
    setUniqueVolumes(volumes);
  };

  const getUniqueTruckers = (transactions: Transaction[]) => {
    const truckers = [...new Set(transactions.map((t) => t.trucker_name))];
    setUniqueTruckers(truckers);
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
    if (selectedVolume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === selectedVolume);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === selectedStatus);
    }
    if (selectedTrucker !== 'all') {
      filtered = filtered.filter((t) => t.trucker_name === selectedTrucker);
    }

    setFilteredTransactions(filtered);
  };

  const handleTruckerFilter = (trucker: string) => {
    setSelectedTrucker(trucker);
    let filtered = transactions;

    if (trucker !== 'all') {
      filtered = filtered.filter((t) => t.trucker_name === trucker);
    }
    if (selectedVolume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === selectedVolume);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === selectedStatus);
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
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === selectedStatus);
    }

    setFilteredTransactions(filtered);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    let filtered = transactions;

    if (status !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === status);
    }
    if (selectedVolume !== 'all') {
      filtered = filtered.filter((t) => t.unit_volume === selectedVolume);
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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Transactions</CardTitle>
          <CardDescription>
            A list of all purchase order transactionss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="startDate" className="w-20">
                  From:
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) =>
                    handleDateRangeFilter(e.target.value, endDate)
                  }
                  className="w-[200px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="endDate" className="w-20">
                  To:
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) =>
                    handleDateRangeFilter(startDate, e.target.value)
                  }
                  className="w-[200px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="truckerFilter" className="w-20">
                  Trucker:
                </Label>
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
                <Label htmlFor="volumeFilter" className="w-20">
                  Volume:
                </Label>
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
              <div className="flex items-center space-x-2">
                <Label htmlFor="statusFilter" className="w-20">
                  Status:
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="rounded-md border">
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
                {filteredTransactions.map((transaction: Transaction) => (
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
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
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
