import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware used ONLY for path matching.
 * No authentication, no cookies, no redirects.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

/**
 * Config matcher:
 * - Middleware runs ONLY on selected paths
 * - No auth enforcement here
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$|pages/home|pages/about|pages/contact|auth|pages/services|pages/events|pages/prototypes).*)",
    "/profile/:path*",
  ],
};
