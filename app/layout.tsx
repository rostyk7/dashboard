import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Management",
  description: "Internal ops dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 bg-slate-900 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-800">
              <span className="text-white font-semibold tracking-tight">OrderOps</span>
              <span className="ml-2 text-slate-500 text-xs">v1</span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavLink href="/orders">Orders</NavLink>
              <NavLink href="/orders?status=REVIEW">Compliance Queue</NavLink>
            </nav>
            <div className="px-6 py-4 border-t border-slate-800 text-slate-500 text-xs">
              order-service :8000
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
