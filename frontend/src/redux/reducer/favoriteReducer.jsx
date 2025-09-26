// src/redux/reducers/favoriteReducer.js
import {
  LOAD_FAVORITES,
  ADD_FAVORITE,
  REMOVE_FAVORITE,
  CHECK_FAVORITE,
  FAVORITE_ERROR,
  FAVORITE_LOADING
} from "../action/actionTypes.js";

const initialState = {
  favorites: [],
  loading: false,
  error: null,
  isFavorite: false,
  favoriteMap: {} // lưu trạng thái từng productId
};

export default function favoriteReducer(state = initialState, action) {
  switch (action.type) {
    case FAVORITE_LOADING:
      return { ...state, loading: true, error: null };

    case LOAD_FAVORITES:
      const map = {};
      action.payload.forEach(fav => { map[fav.product_id] = true; });
      return { ...state, favorites: action.payload, favoriteMap: map, loading: false };

    case ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
        favoriteMap: { ...state.favoriteMap, [action.payload.product_id]: true },
        loading: false
      };

    case REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.product_id !== action.payload),
        favoriteMap: { ...state.favoriteMap, [action.payload]: false },
        loading: false
      };

    case CHECK_FAVORITE:
      return {
        ...state,
        favoriteMap: { ...state.favoriteMap, [action.payload.productId]: action.payload.isFavorite },
        loading: false
      };

    case FAVORITE_ERROR:
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
}
