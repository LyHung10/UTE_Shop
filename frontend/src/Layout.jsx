import { Outlet } from "react-router-dom";
import Header from "@/features/home/components/Header.jsx";
import Footer from "@/features/home/components/Footer.jsx";
import React from "react";
import ChatBox from "@/features/chat/ChatBox.jsx";
const Layout = () => {
  return (
    <div>
      <Header />
      <main className="mt-[120px]">
        <Outlet />
      </main>
      <ChatBox apiUrl="http://localhost:4000" />
      <Footer />
    </div>
  );
};


export default Layout;