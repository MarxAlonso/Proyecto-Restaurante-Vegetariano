import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-900 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
