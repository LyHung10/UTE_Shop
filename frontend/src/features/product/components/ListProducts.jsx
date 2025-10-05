import {Card, CardContent} from "@/components/ui/card.jsx";
import {Star} from "lucide-react";
import ProductCard from "@/features/home/components/ProductCard.jsx";

const ListProducts = ({ listProducts }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listProducts && listProducts.length > 0 ? (
                listProducts.map((item) => (
                    <ProductCard key={item.id} product={item}/>
                ))
            ) : (
                <span>Not found data</span>
            )}
        </div>
    );
};

export default ListProducts;
