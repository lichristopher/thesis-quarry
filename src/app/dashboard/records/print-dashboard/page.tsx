'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  price: number;
  payment_status: string;
  trucker_name: string;
  unit_volume: string;
  created_at: string;
}

interface DailySales {
  date: string;
  total: number;
}

export default function PrintDashboard() {
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const searchParams = useSearchParams();

  const filterTransactions = useCallback(
    (transactions: Transaction[]) => {
      let filtered = [...transactions];
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const trucker = searchParams.get('trucker');
      const volume = searchParams.get('volume');
      const status = searchParams.get('status');

      if (startDate) {
        filtered = filtered.filter((t) => t.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter((t) => t.date <= endDate);
      }
      if (trucker && trucker !== 'all') {
        filtered = filtered.filter((t) => t.trucker_name === trucker);
      }
      if (volume && volume !== 'all') {
        filtered = filtered.filter((t) => t.unit_volume === volume);
      }
      if (status && status !== 'all') {
        filtered = filtered.filter((t) => t.payment_status === status);
      }

      return filtered;
    },
    [searchParams]
  );

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const supabase = createClient();
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    const filteredTransactions = filterTransactions(transactions || []);
    calculateDailySales(filteredTransactions);
    setTotalAmount(calculateTotal(filteredTransactions));
    setPendingAmount(calculatePendingTotal(filteredTransactions));
  };

  const calculateDailySales = (transactions: Transaction[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDate = last7Days.reduce(
      (acc: { [key: string]: number }, date) => {
        acc[date] = 0;
        return acc;
      },
      {}
    );

    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (
        salesByDate.hasOwnProperty(date) &&
        transaction.payment_status === 'PAID'
      ) {
        salesByDate[date] += transaction.price;
      }
    });

    const dailySalesData = Object.entries(salesByDate).map(([date, total]) => ({
      date: new Date(date).toLocaleDateString(),
      total,
    }));

    setDailySales(dailySalesData);
  };

  const calculateTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, transaction) => {
      if (transaction.payment_status === 'PAID') {
        return sum + transaction.price;
      }
      return sum;
    }, 0);
  };

  const calculatePendingTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, transaction) => {
      if (transaction.payment_status === 'PENDING') {
        return sum + transaction.price;
      }
      return sum;
    }, 0);
  };

  return (
    <div className="container mx-auto p-8">
      <style>
        {`
          @media print {
            body { margin: 0; padding: 20px; }
            .print-header { margin-bottom: 30px; }
            .no-print { display: none; }
          }
        `}
      </style>

      <div className="print-header text-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard Summary</h1>
        <p className="text-gray-600">
          Generated on: {new Date().toLocaleDateString()}
        </p>
        <div className="text-sm text-gray-500 mt-2">
          {searchParams.get('startDate') && (
            <span>From: {searchParams.get('startDate')} </span>
          )}
          {searchParams.get('endDate') && (
            <span>To: {searchParams.get('endDate')} </span>
          )}
          {searchParams.get('trucker') !== 'all' &&
            searchParams.get('trucker') && (
              <span>Trucker: {searchParams.get('trucker')} </span>
            )}
          {searchParams.get('volume') !== 'all' &&
            searchParams.get('volume') && (
              <span>Volume: {searchParams.get('volume')} </span>
            )}
          {searchParams.get('status') !== 'all' &&
            searchParams.get('status') && (
              <span>Status: {searchParams.get('status')}</span>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Total Sales (Paid)</h2>
          <p className="text-2xl text-green-600">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'PHP',
            }).format(totalAmount)}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Total Pending</h2>
          <p className="text-2xl text-yellow-600">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'PHP',
            }).format(pendingAmount)}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          Daily Sales (Last 7 Days)
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
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

      <button
        onClick={() => window.print()}
        className="no-print mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Print Dashboard
      </button>
    </div>
  );
}
