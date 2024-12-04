import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LoginNav() {
  return (
    <nav className="flex justify-center space-x-4 py-4">
      <Button asChild variant="outline">
        <Link href="/login">Admin Login</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/member-login">Member Login</Link>
      </Button>
    </nav>
  );
}
