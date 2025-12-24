
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Paths to protect
    const protectedPaths = ['/admin', '/dashboard'];

    // Check if current path matches any protected path
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        // Check for session cookie
        const session = request.cookies.get('__session')?.value;

        if (!session) {
            // Redirect to login if no session
            // For now, redirect to home with a login paramenter or just home
            // ideally /login if it exists, or open the auth modal.
            // Current app seems to use modal login on home/header. 
            // Redirecting to root for now.
            const url = request.nextUrl.clone();
            url.pathname = '/';
            url.searchParams.set('auth', 'required'); // Optional: Client can read this to open modal
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
