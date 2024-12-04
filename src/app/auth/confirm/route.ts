// import { type EmailOtpType } from '@supabase/supabase-js';
// import { type NextRequest } from 'next/server';

// import { createClient } from '@/utils/supabase/server';
// import { redirect } from 'next/navigation';

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const token_hash = searchParams.get('token_hash');
//   const type = searchParams.get('type') as EmailOtpType | null;
//   const next = searchParams.get('next') ?? '/';

//   if (token_hash && type) {
//     const supabase = await createClient();

//     const { error } = await supabase.auth.verifyOtp({
//       type,
//       token_hash,
//     });
//     if (!error) {
//       // redirect user to specified redirect URL or root of app
//       redirect(next);
//     }
//   }

//   // redirect the user to an error page with some instructions
//   redirect('/error');
// }

// app/auth/confirm/route.ts
import { env } from '@/env';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  // const redirectTo = request.nextUrl.clone()
  // redirectTo.pathname = next

  if (token_hash && type) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    }
  }

  redirect('/');
}
