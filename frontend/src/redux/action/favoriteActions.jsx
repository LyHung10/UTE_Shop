// src/redux/actions/favoriteActions.js
import axios from "../../utils/axiosCustomize.jsx"
import {
    LOAD_FAVORITES,
    ADD_FAVORITE,
    REMOVE_FAVORITE,
    CHECK_FAVORITE,
    FAVORITE_ERROR,
    FAVORITE_LOADING
} from "./actionTypes";

// URL base
const API_BASE = "api/favorites";

// load danh sách favorite
export const loadFavorites = () => async (dispatch) => {
    dispatch({ type: FAVORITE_LOADING });
    try {
        const res = await axios.get(`${API_BASE}/list`);
        dispatch({ type: LOAD_FAVORITES, payload: res.favorites });
    } catch (err) {
        dispatch({ type: FAVORITE_ERROR, payload: err.response?.error || err.message });
    }
};

// thêm favorite
export const addFavorite = (productId) => async (dispatch) => {
    dispatch({ type: FAVORITE_LOADING });
    try {
        const res = await axios.post(`${API_BASE}/add`, { productId });
        dispatch({ type: ADD_FAVORITE, payload: res.favorite });
    } catch (err) {
        dispatch({ type: FAVORITE_ERROR, payload: err.response?.error || err.message });
    }
};

// xóa favorite
export const removeFavorite = (productId) => async (dispatch) => {
    dispatch({ type: FAVORITE_LOADING });
    try {
        await axios.post(`${API_BASE}/remove`, { productId });
        dispatch({ type: REMOVE_FAVORITE, payload: productId });
    } catch (err) {
        dispatch({ type: FAVORITE_ERROR, payload: err.response?.error || err.message });
    }
};

// check trạng thái favorite
export const checkFavorite = (productId) => async (dispatch) => {
    dispatch({ type: FAVORITE_LOADING });
    try {
        const res = await axios.get(`${API_BASE}/check`, { params: { productId } });
        dispatch({ type: CHECK_FAVORITE, payload: { productId, isFavorite: res.isFavorite } });
    } catch (err) {
        dispatch({ type: FAVORITE_ERROR, payload: err.response?.error || err.message });
    }
};
