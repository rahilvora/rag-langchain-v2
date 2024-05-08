"use client";

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mb-4">
      <a className={`mr-4 ${pathname === "/" ? "text-white border-b" : ""}`} href="/">Chat</a>
      <a className={`mr-4 ${pathname === "/rag_url" ? "text-white border-b" : ""}`} href="/rag_url">RAG- Chat with URL</a>
      <a className={`mr-4 ${pathname === "/agent" ? "text-white border-b" : ""}`} href="/agent">Chat with Agent</a>
    </nav>
  );
}