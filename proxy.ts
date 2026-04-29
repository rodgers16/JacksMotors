import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // Only gate /admin/* (excluding /admin/login itself)
  const isAdmin = nextUrl.pathname.startsWith("/admin");
  const isLogin = nextUrl.pathname.startsWith("/admin/login");

  if (isAdmin && !isLogin && !session) {
    const redirect = new URL("/admin/login", nextUrl);
    redirect.searchParams.set("from", nextUrl.pathname);
    return Response.redirect(redirect);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
