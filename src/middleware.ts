// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Apply Clerk to everything EXCEPT /api/sse/*
//     '/((?!api\/sse).*)',
//   ],
// };

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (static files)
     * - api routes (webhooks, inngest, sse)
     * - static files
     */
    "/((?!_next|api|.*\\..*).*)",
  ],
};

