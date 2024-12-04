'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get('date') as string,
      receipt_number: formData.get('receipt_number') as string,
      trucker_name: formData.get('trucker_name') as string,
      plate_number: formData.get('plate_number') as string,
      time: formData.get('time') as string,
      quantity: Number(formData.get('quantity')),
      price: Number(formData.get('price')),
      destination: formData.get('destination') as string,
      payment_method: formData.get('payment_method') as string,
      payment_status: formData.get('payment_status') as string,
    };

    const supabase = createClient();
    const { error } = await supabase.from('transactions').insert([data]);

    if (error) {
      console.error('Error inserting transaction:', error);
      alert('Error creating transaction');
    } else {
      router.push('/dashboard/records');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>Create a new transaction record</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" name="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input type="time" id="time" name="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input id="receipt_number" name="receipt_number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trucker_name">Trucker Name</Label>
                <Input id="trucker_name" name="trucker_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate_number">Plate Number</Label>
                <Input id="plate_number" name="plate_number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input type="number" id="quantity" name="quantity" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" name="destination" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select name="payment_method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select name="payment_status" required>
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
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Transaction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
