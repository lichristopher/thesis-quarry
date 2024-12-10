import Image from 'next/image';
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
import { login } from './actions';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Image */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <Image
          src="/quarry.png"
          alt="Earthfill quarry with heavy machinery"
          className="object-cover"
          quality={100}
          fill
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h2 className="text-2xl font-semibold tracking-tight">
            Renan&apos;s Earthfill Quarry
          </h2>
          <p className="text-sm text-gray-200">
            Data Billing Management System
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6"></div>
            <Image
              src="/logo.png"
              alt="Company logo"
              width={360}
              height={360}
              className="mx-auto"
              priority
            />
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" formAction={login} className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{' '}
              </span>
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
            {/* <div className="mt-4 text-center text-sm">
              <a href="#" className="text-primary hover:underline">
                Forgot your password?
              </a>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
