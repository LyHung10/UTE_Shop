import {Outlet} from "react-router-dom";
import Header from "@/features/home/components/Header.jsx";
const Layout =() => {
    return(
        <div>
            <Header/>
            <Outlet/>
        </div>
    );
}

export default Layout;