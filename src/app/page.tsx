'use client';
import { LoginNav } from '@/components/LoginNav';

export default function Home() {
  // const router = useRouter();

  // const handleSignOut = async () => {
  //   const supabase = createClient();
  //   const { error } = await supabase.auth.signOut();

  //   if (error) {
  //     console.error('Error signing out:', error);
  //   } else {
  //     router.refresh();
  //     router.push('/login');
  //   }
  // };

  // const handleClick = async () => {
  //   const supabase = createClient();
  //   const {
  //     data: { user },
  //     error,
  //   } = await supabase.auth.getUser();

  //   const metadata = user?.user_metadata;
  //   if (error) {
  //     console.error('Error fetching user:', error);
  //   } else {
  //     console.log('Current user:', user);
  //     console.log('User metadata:', metadata);
  //   }
  // };

  // const handleGetAllUsers = async () => {
  //   const supabase = createClient();

  //   const { data: profiles, error } = await supabase
  //     .from('profiles')
  //     .select('id, first_name, last_name')
  //     .order('first_name');

  //   if (error) {
  //     console.error('Error fetching profiles:', error);
  //     return;
  //   }

  //   console.log('Profiles:', profiles);
  // };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform</h1>
      <LoginNav />
    </div>
  );
}
