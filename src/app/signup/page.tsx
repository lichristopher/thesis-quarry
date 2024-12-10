import Image from 'next/image';
import { signup } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
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

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6"></div>
            <Image
              src="/logo.png"
              alt="Company logo"
              width={200}
              height={200}
              className="mx-auto"
              priority
            />
            <CardTitle className="text-2xl text-center mt-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-center mb-2">
              Enter your information to register
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" type="text" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" type="text" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="truckerName">Trucker Name</Label>
                <Input
                  id="truckerName"
                  name="truckerName"
                  type="text"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" formAction={signup} className="w-full">
                Sign up
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
