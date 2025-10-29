import {Outlet} from "react-router-dom";
import UserSidebar from "@/features/user/UserSidebar.jsx";
import {fetchUser} from "@/redux/action/userAction.jsx";
import {useDispatch} from "react-redux";
import {useEffect} from "react";

const UserLayout = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUser());
    }, []);
    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section aria-labelledby="products-heading" className="pt-6 pb-24">
                    <h2 id="products-heading" className="sr-only">Products</h2>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        <div className="self-start">
                            <UserSidebar />
                        </div>
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <Outlet/>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default  UserLayout;