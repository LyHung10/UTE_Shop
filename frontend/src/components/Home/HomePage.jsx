import React from "react";
import TopDiscounts from "./TopDiscounts.jsx";

const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Home Page</h1>

      {/* Section: Sản phẩm khuyến mãi cao */}
      <TopDiscounts />
    </div>
  );
}

export default HomePage;
