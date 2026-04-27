import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
