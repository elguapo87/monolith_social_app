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
    // Exclude SSE and Clerk webhooks
    "/((?!api/sse|api/webhooks/clerk).*)",
  ],
};
