import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import "nprogress/nprogress.css";
import App from "./App.jsx";
import {BrowserRouter} from "react-router-dom";
import {store, persistor} from "./redux/store.jsx";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import ScrollToTop from "@/admin/components/common/ScrollToTop.jsx";
import AuthProvider from "@/app/providers/AuthProvider.jsx";
import {HelmetProvider} from "react-helmet-async";
import {ThemeProvider} from "@/admin/context/ThemeContext.jsx";
import PermissionProvider from "@/app/providers/PermissionProvider.jsx";
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            {/*<StrictMode>*/}
                <BrowserRouter>
                    <AuthProvider>
                        <PermissionProvider>
                            <HelmetProvider>
                                <ThemeProvider>
                                    <ScrollToTop />
                                    <App />
                                </ThemeProvider>
                            </HelmetProvider>
                        </PermissionProvider>
                    </AuthProvider>
                </BrowserRouter>
            {/*</StrictMode>*/}
        </PersistGate>
    </Provider>
)
