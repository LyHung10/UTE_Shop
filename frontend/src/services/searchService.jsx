import axios from "../utils/axiosCustomize.jsx"

export const searchProducts = async (query, page = 1, limit = 8) => {
  try {
    const response = await axios.get(`api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response
  } catch (error) {
    console.error("Search products error:", error)
    throw error
  }
}

export const getSearchSuggestions = async (query) => {
  try {
    const response = await axios.get(`api/search/suggestions?q=${encodeURIComponent(query)}`)
    return response
  } catch (error) {
    console.error("Search suggestions error:", error)
    throw error
  }
}