import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAppRoute = pathname === '/app' || pathname.startsWith('/app/');
  const isAuthRoute = pathname === '/auth' || pathname.startsWith('/auth/');

  // Supabase not configured — skip auth client, avoid runtime crash
  if (!isSupabaseConfigured()) {
    // Development: allow dashboard preview without OAuth
    if (process.env.NODE_ENV === 'development' && isAppRoute) {
      return NextResponse.next();
    }
    if (isAppRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('setup', 'required');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/app', '/app/:path*', '/auth', '/auth/:path*'],
};
