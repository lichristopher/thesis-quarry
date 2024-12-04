'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ClipboardList, ShoppingCart, Wallet, Users } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.refresh();
      router.push('/login');
    }
  };

  return (
    <aside className="bg-gray-800 text-white w-64 h-screen p-4 sticky top-0">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Dashboard</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard/records"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                Records
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/users"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              >
                <Users className="w-5 h-5 mr-2" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/purchase-orders"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Purchase Orders
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/cash-records"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Cash Records
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <div>
                {loading ? (
                  <p className="text-sm">Loading...</p>
                ) : user ? (
                  <>
                    <p className="text-sm font-medium">
                      {user.user_metadata.trucker_name}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </>
                ) : (
                  <p className="text-sm">Not signed in</p>
                )}
              </div>
            </div>
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-sm text-white bg-red-600/80 hover:bg-red-700/90 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
