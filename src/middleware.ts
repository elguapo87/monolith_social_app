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
      Only run Clerk middleware on pages & app routes,
      NEVER on API routes
    */
    "/((?!api).*)",
  ],
};
