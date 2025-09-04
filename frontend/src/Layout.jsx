import Header from "./features/home/components/Header.jsx"
import {Outlet} from "react-router-dom";
const Layout =() => {
    return(
        <div>
            <Header/>
            <Outlet/>
        </div>
    );
}

export default Layout;