import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import "nprogress/nprogress.css";
import App from "./App.jsx";
import {BrowserRouter} from "react-router-dom";
import {store, persistor} from "./redux/store.jsx";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import ScrollToTop from "@/components/ScrollToTop.jsx";
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <StrictMode>
                <BrowserRouter>
                    <ScrollToTop />
                    <App />
                </BrowserRouter>
            </StrictMode>
        </PersistGate>
    </Provider>
)
