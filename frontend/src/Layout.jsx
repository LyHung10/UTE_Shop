import { Outlet } from "react-router-dom";
import Header from "@/features/home/components/Header.jsx";
const Layout = () => {
  return (
    <div>
      <Header />
      <main className="pt-[120px]"> {/* 120px = chiều cao header */}
        <Outlet />
      </main>
    </div>
  );
};


export default Layout;