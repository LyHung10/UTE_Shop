// components/FavoriteButton.js
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useFavorite } from "../../hooks/useFavorite"

const FavoriteButton = ({ productId, size = "default", showToast = true }) => {
    const { isFavorite, loading, toggleFavorite } = useFavorite(productId)

    const sizes = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6"
    }

    const buttonSizes = {
        small: "p-1.5",
        default: "p-2",
        large: "p-2.5"
    }

    return (
        <motion.button
            className={`bg-white shadow-red-200 shadow-md rounded-full transition-colors ${isFavorite ? "text-red-500" : "text-gray-700 hover:text-red-500"
                } ${buttonSizes[size]}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation()
                toggleFavorite()
            }}
            disabled={loading}
        >
            <Heart
                className={`${sizes[size]} ${isFavorite ? "fill-current" : ""} ${loading ? "opacity-50" : ""
                    }`}
            />
        </motion.button>
    )
}

export default FavoriteButton