
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifyFirebaseIdToken(idToken: string): Promise<boolean> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey || !idToken) return false;

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            }
        );

        if (!response.ok) return false;
        const data = await response.json();
        return Array.isArray(data?.users) && data.users.length > 0;
    } catch {
        return false;
    }
}

function redirectToLogin(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
}

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
            return redirectToLogin(request);
        }

        const validToken = await verifyFirebaseIdToken(session);
        if (!validToken) {
            const response = redirectToLogin(request);
            response.cookies.delete('__session');
            return response;
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
