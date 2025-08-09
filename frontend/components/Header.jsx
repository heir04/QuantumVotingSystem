"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white/90 backdrop-blur shadow fixed top-0 left-0 z-50 font-sans font-bold">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 select-none">
          <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-500 to-green-400 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
          </span>
          <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent tracking-tight transition-colors duration-300 hover:from-purple-600 hover:to-blue-400 font-sans">Qvote</span>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/admin/login">Admin Portal</NavLink>
          <NavLink href="/voter/login">Voter Portal </NavLink>
        </div>
        <button
          className="md:hidden flex items-center transition-transform duration-200 hover:scale-110"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40 flex items-start justify-end" onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 right-0 w-4/5 max-w-xs bg-white/95 flex flex-col items-center gap-8 py-8 px-4 shadow-2xl rounded-bl-3xl animate-fadeInUp mt-4 max-h-[80vh]"
            style={{ minHeight: '0', maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button at the top right inside the menu */}
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center gap-8 mt-8 w-full">
              <NavLink href="/" onClick={() => setOpen(false)}>Home</NavLink>
              <NavLink href="/admin/login" onClick={() => setOpen(false)}>Admin Portal</NavLink>
              <NavLink href="/voter/login" onClick={() => setOpen(false)}>Voter Portal</NavLink>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative font-bold text-gray-700 transition-colors duration-300 hover:text-blue-600 px-1 py-1 font-sans"
    >
      <span className="transition-colors duration-300">{children}</span>
      <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300 group-hover:w-full hover:w-full"></span>
    </Link>
  );
}
