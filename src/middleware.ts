import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Extract pathname from the request URL
  const { pathname } = request.nextUrl;

  // Retrieve token and role from cookies
  let cookie_token = request.cookies.get("voto_user");
  let cookie_role = request.cookies.get("voto_user_role");
  const token = cookie_token?.value;
  const role = cookie_role?.value;

  // Check if the current path is an authentication path
  const isAuthenticationPath =
    /^(\/organisation\/(login|register)|\/voter\/login)$/.test(pathname);

  // Redirect to home if token exists on authentication path
  if (token && isAuthenticationPath) {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  // Continue to the next middleware if no token on authentication path
  if (!token && isAuthenticationPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.rewrite(new URL("/organisation/login", request.url));
  }

  if (
    token &&
    role === "organisation" &&
    !pathname.startsWith(`/organisation`)
  ) {
    return NextResponse.rewrite(new URL("/", request.url));
  } else if (token && role === "voter" && !pathname.startsWith(`/voter`)) {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  if (token) return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|auth/forgot-password|auth/reset-password|organisation/voters|organisation/candidates|voter/elections|_next/static|_next/image|favicon.ico).*)",
  ],
};
