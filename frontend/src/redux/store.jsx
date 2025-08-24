// import {createStore, applyMiddleware, compose} from "redux";
// import {thunk} from "redux-thunk";
// import {persistStore, persistReducer} from 'redux-persist'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
// import rootReducer from "./reducer/rootReducer";
// Kết nối với Redux DevTools nếu có cài trên trình duyệt
//
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//
// const persistConfig = {
//     key: 'root',
//     storage,
// }
//
// const persistedReducer = persistReducer(persistConfig, rootReducer)
// const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));
// let persistor = persistStore(store)
//
// export {store, persistor}
import {createStore, applyMiddleware, compose} from 'redux'
import {thunk} from "redux-thunk";
import rootReducer from './reducer/rootReducer'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
)

export default store;