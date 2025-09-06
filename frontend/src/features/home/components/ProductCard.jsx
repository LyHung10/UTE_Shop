import { useNavigate } from "react-router-dom";
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition bg-white"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img
        src={product.images?.[0]?.url}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h4 className="mt-2 text-lg font-semibold text-gray-900">
        {product.name}
      </h4>
      <p className="text-gray-600">{product.price} ₫</p>
    </div>
  );
};

export default ProductCard;
