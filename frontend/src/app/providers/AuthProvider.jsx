import { useSelector } from "react-redux";
import { AuthContext } from "../contexts/AuthContext";

const AuthProvider = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.authStatus.isAuthenticated);

    return (
        <AuthContext.Provider value={{ isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
