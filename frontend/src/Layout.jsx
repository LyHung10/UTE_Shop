import { Outlet } from "react-router-dom";
import Header from "@/features/home/components/Header.jsx";
const Layout = () => {
  return (
    <div>
      <Header />
      <main className="mt-[120px]">
        <Outlet />
      </main>
    </div>
  );
};


export default Layout;