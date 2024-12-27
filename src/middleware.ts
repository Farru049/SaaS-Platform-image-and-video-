import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
    '/sign-up',  // Public sign-up page
    '/sign-in',  // Public sign-in page
    '/',        // Public landing page
    '/home'     // Public home page
]);

// Define public API routes that do not require authentication
const isPublicApiRoute = createRouteMatcher([
    '/api/videos', // Public API route for videos
]);

// Middleware function for handling authentication and route-based access
export default clerkMiddleware(async (auth, req) => {
    // Fetch user authentication data asynchronously
    const { userId } = await auth();

    // Get the current URL of the request
    const currentUrl = new URL(req.url);

    // Check if the user is accessing the dashboard
    const isAccessingDashboard = currentUrl.pathname === '/home';

    // Check if the request is for an API route
    const isApiRequest = currentUrl.pathname.startsWith('/api');

    // If user is authenticated and accessing a public route but not the dashboard, redirect to the dashboard
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    // If user is not authenticated
    if (!userId) {
        // Redirect unauthenticated users away from protected routes
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        // Redirect unauthenticated users trying to access restricted API routes
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    // Allow the request to proceed for all other cases
    return NextResponse.next();
});

//configuration for the middleware matcher to include/exclude certain routes
export const config = {
    matcher: [
        // Match all routes except Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

        // Always match API routes
        '/(api|trpc)(.*)',
    ],
};
