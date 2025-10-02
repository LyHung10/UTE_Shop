// hooks/useFavorite.js
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addFavorite, removeFavorite, checkFavorite } from "../redux/action/favoriteActions.jsx"
import toast from "react-hot-toast"

export const useFavorite = (productId) => {
  const dispatch = useDispatch()
  
  // Lấy state từ store
  const favoriteMap = useSelector(state => state.favorite.favoriteMap)
  const loading = useSelector((state) => state.favorite.loading)
  
  // Kiểm tra xem sản phẩm có trong favorite không
  const isFavorite = favoriteMap[productId] || false

  // Tự động check favorite khi component mount
  useEffect(() => {
    if (productId) {
      dispatch(checkFavorite(productId))
    }
  }, [dispatch, productId])

  // Hàm toggle favorite
  const toggleFavorite = () => {
    if (!productId) return

    if (isFavorite) {
      dispatch(removeFavorite(productId))
      toast.success("Removed from favorites")
    } else {
      dispatch(addFavorite(productId))
      toast.success("Added to favorites")
    }
  }

  // Hàm thêm vào favorite
  const addToFavorite = () => {
    if (!productId) return
    dispatch(addFavorite(productId))
    toast.success("Added to favorites")
  }

  // Hàm xóa khỏi favorite
  const removeFromFavorite = () => {
    if (!productId) return
    dispatch(removeFavorite(productId))
    toast.success("Removed from favorites")
  }

  return {
    isFavorite,
    loading,
    toggleFavorite,
    addToFavorite,
    removeFromFavorite
  }
}