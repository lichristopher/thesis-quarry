'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Home() {
const router = useRouter();

const handleSignOut = async () => {
const supabase = createClient();
const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.refresh(); // Refresh the page to update auth state
      router.push('/login'); // Redirect to login page
    }

};

const handleClick = async () => {
const supabase = createClient();
const {
data: { user },
error,
} = await supabase.auth.getUser();

    const metadata = user.user_metadata;
    if (error) {
      console.error('Error fetching user:', error);
    } else {
      console.log('Current user:', user);
      console.log('User metadata:', metadata);
    }

};

const handleGetAllUsers = async () => {
const supabase = createClient();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .order('first_name');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log('Profiles:', profiles);

};

return (
<main className="flex min-h-screen flex-col items-center justify-between p-24">
<div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
<div className="flex gap-4">
<button
            onClick={handleGetAllUsers}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
Get All Users
</button>

          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            Check Current User
          </button>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>

);
}
