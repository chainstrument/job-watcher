import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth(function proxy(req) {
  const { nextUrl } = req

  const isPublic =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/api/collect"

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (req.auth && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
