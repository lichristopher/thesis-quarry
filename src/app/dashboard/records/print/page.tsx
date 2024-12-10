'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Transaction {
  id: number;
  date: string;
  receipt_number: string;
  trucker_name: string;
  plate_number: string;
  time: string;
  unit_volume: string;
  price: number;
}

export default function PrintPage() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [volumeTotals, setVolumeTotals] = useState<{ [key: string]: number }>(
    {}
  );
  const [pricePerUnit] = useState<{ [key: string]: number }>({
    '10 cubic meter': 1650.0,
    '15 cubic meter': 2400.0,
  });

  useEffect(() => {
    const fetchFilteredTransactions = async () => {
      const supabase = createClient();
      let query = supabase.from('transactions').select('*');

      // Apply filters from URL parameters
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const trucker = searchParams.get('trucker');
      const volume = searchParams.get('volume');
      const status = searchParams.get('status');

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (trucker && trucker !== 'all')
        query = query.eq('trucker_name', trucker);
      if (volume && volume !== 'all') query = query.eq('unit_volume', volume);
      if (status && status !== 'all')
        query = query.eq('payment_status', status);

      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error('Error:', error);
        return;
      }

      setTransactions(data || []);

      // Calculate volume totals
      const totals: { [key: string]: number } = {};
      data?.forEach((t) => {
        totals[t.unit_volume] = (totals[t.unit_volume] || 0) + 1;
      });
      setVolumeTotals(totals);

      // Debug logging
      console.log('Volume Totals:', totals);
      console.log('Price Per Unit:', pricePerUnit);
    };

    fetchFilteredTransactions();
  }, [searchParams]);

  useEffect(() => {
    // Auto-print when data is loaded
    if (transactions.length > 0) {
      // window.print();
    }
  }, [transactions]);

  const calculateTotal = () => {
    let total = 0;
    Object.entries(volumeTotals).forEach(([volume, count]) => {
      const price = pricePerUnit[volume];
      if (price === undefined) {
        console.warn(`No price found for volume: ${volume}`);
        return;
      }
      total += price * count;
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">RENAN&apos;s EARTHFILL QUARRY</h1>
        <p className="text-sm">P-5, Rizal, Buenavista, Agusan del Norte</p>
      </div>

      {/* Billing Info */}
      <div className="flex justify-between mb-6">
        <div>
          <p>
            <span className="font-bold">Billing Period:</span>{' '}
            {searchParams.get('startDate')} - {searchParams.get('endDate')}
          </p>
          <p>
            <span className="font-bold">Billing To:</span>{' '}
            {searchParams.get('trucker')}
          </p>
        </div>
        <div>
          <p>
            <span className="font-bold">Date:</span>{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border border-gray-300">
            <th className="border p-2 text-left">no</th>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">DR #</th>
            <th className="border p-2 text-left">Trucker</th>
            <th className="border p-2 text-left">Plate #</th>
            <th className="border p-2 text-left">Time</th>
            <th className="border p-2 text-left">Qty/Unit</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <tr key={t.id} className="border border-gray-300">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">
                {new Date(t.date).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: '2-digit',
                })}
              </td>
              <td className="border p-2">{t.receipt_number}</td>
              <td className="border p-2">{t.trucker_name}</td>
              <td className="border p-2">{t.plate_number}</td>
              <td className="border p-2">{t.time}</td>
              <td className="border p-2">{t.unit_volume}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Truckloads */}
      <div className="mb-6 border border-gray-300">
        <h3 className="font-bold p-2">Total Truckloads</h3>
        {Object.entries(volumeTotals).map(([volume, count]) => (
          <div key={volume} className="flex justify-between p-2 border-t">
            <span>{volume}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {/* Price per Truckloads */}
      <div className="mb-6 border border-gray-300">
        <h3 className="font-bold p-2">Price per Truckloads</h3>
        {Object.entries(pricePerUnit).map(([volume, price]) => (
          <div key={volume} className="flex justify-between p-2 border-t">
            <span>{volume}</span>
            <span>Php {price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Computation */}
      <div className="mb-6 border border-gray-300">
        <h3 className="font-bold p-2">Computation</h3>
        {Object.entries(volumeTotals).map(([volume, count]) => (
          <div key={volume} className="p-2 border-t">
            <p>for {volume}</p>
            <p>
              {new Intl.NumberFormat('en-PH').format(pricePerUnit[volume])} x{' '}
              {count} ={' '}
              {new Intl.NumberFormat('en-PH').format(
                pricePerUnit[volume] * count
              )}
            </p>
          </div>
        ))}
        <div className="p-2 border-t">
          <p>
            Total = {new Intl.NumberFormat('en-PH').format(calculateTotal())}
          </p>
        </div>
      </div>

      {/* Total Bill */}
      <div className="text-right mb-12">
        <p className="font-bold">
          TOTAL BILL: ₱{new Intl.NumberFormat('en-PH').format(calculateTotal())}
        </p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-16">
        <div>
          <p className="font-bold">Prepared by:</p>
          <p>Ramon Sio</p>
          <p className="text-sm text-gray-600">Operation Manager</p>
        </div>
        <div>
          <p className="font-bold">Approved by:</p>
          <p>Reynan P. Gonzaga</p>
          <p className="text-sm text-gray-600">Proprietor</p>
        </div>
      </div>
    </div>
  );
}
