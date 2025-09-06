import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Star } from "lucide-react"
import casualStyle from "@/assets/non.jpg"
import banner from "../../../assets/coming_soon.jpg"
import banner2 from "../../../assets/ao_khoa_chinh_tri_luat.jpg"
import ProductSlider from "@/features/home/components/ProductSlider.jsx";
import {
  getBestSellingProducts,
  getMostViewedProducts,
  getNewestProducts,
  getTopDiscountProducts
} from "@/services/productService.jsx";
import {useEffect, useState} from "react";

export default function HomePage() {
  const [listTopNewestProducts, setListTopNewestProducts] = useState([]);
  const [listTopDiscountProducts, setListTopDiscountProducts] = useState([]);
  const [listTopMostViewedProducts, setListTopMostViewedProducts] = useState([]);
  const [listBestSellingProducts, setListBestSellingProducts] = useState([]);
  const fetchListTopDiscountProducts = async () => {
    let data = await getTopDiscountProducts();
    setListTopDiscountProducts(data);
  };
  const fetchListBestSellingProducts = async () => {
    let data = await getBestSellingProducts();
    setListBestSellingProducts(data);
  };
  const fetchListTopNewestProducts = async () => {
    let data = await getNewestProducts();
    setListTopNewestProducts(data);
  };
  const fetchTopMostViewedProducts = async () => {
    let data = await getMostViewedProducts();
    setListTopMostViewedProducts(data);
  };
  useEffect(() => {
    fetchListTopNewestProducts();
    fetchListTopDiscountProducts();
    fetchTopMostViewedProducts();
    fetchListBestSellingProducts();
  }, []);
  return (
    <div className="mt-30 min-h-screen bg-white">

      <section className="bg-white">
        <div className="container mx-auto px-35 flex flex-col lg:flex-row items-center ">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-black">
              FIND CLOTHES
              <br />
              THAT MATCHES
              <br />
              YOUR STYLE
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your
              individuality and cater to your sense of style.
            </p>
            <Button className="bg-black text-white px-8 py-3 rounded-full text-lg">Shop Now</Button>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-black">200+</div>
                <div className="text-gray-600 text-sm">International Brands</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">2,000+</div>
                <div className="text-gray-600 text-sm">High-Quality Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">30,000+</div>
                <div className="text-gray-600 text-sm">Happy Customers</div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <img src={banner} alt="Stylish couple" className="p-20 w-full h-full object-fill rounded-lg" />
            {/* Decorative stars */}
            <div className="absolute top-20 right-10 text-black text-4xl">✦</div>
            <div className="absolute bottom-20 left-10 text-black text-2xl">✦</div>
          </div>
        </div>
      </section>
      <div className="border-t border-gray-200"></div>
      <ProductSlider
          listProducts = {listTopNewestProducts}
          nameTop = {"NEW ARRIVALS"}
      />
      <div className="border-t border-gray-200"></div>
      <ProductSlider
          listProducts = {listTopDiscountProducts}
          nameTop = "BEST DEALS"
      />
      <div className="border-t border-gray-200"></div>
      <ProductSlider
          listProducts = {listTopMostViewedProducts}
          nameTop = "MOST VIEWED"
      />
      <div className="border-t border-gray-200"></div>
      <ProductSlider
          listProducts = {listBestSellingProducts}
          nameTop = "BEST SELLERS"
      />
      <div className="border-t border-gray-200"></div>

      {/* Brand Bar */}
      <section className="bg-black py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="text-white text-2xl font-bold">VERSACE</div>
            <div className="text-white text-2xl font-bold">ZARA</div>
            <div className="text-white text-2xl font-bold">GUCCI</div>
            <div className="text-white text-2xl font-bold">PRADA</div>
            <div className="text-white text-2xl font-bold">Calvin Klein</div>
          </div>
        </div>
      </section>

      {/* Browse by Dress Style */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-black">BROWSE BY DRESS STYLE</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden h-64 border-0">
              <CardContent className="p-0 h-full">
                <img src={casualStyle} alt="Casual style" className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6">
                  <h4 className="text-2xl font-bold text-black">Casual</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden h-64 border-0">
              <CardContent className="p-0 h-full">
                <img src="/images/formal-style.png" alt="Formal style" className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6">
                  <h4 className="text-2xl font-bold text-white">Formal</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden h-64 border-0">
              <CardContent className="p-0 h-full">
                <img src="/images/party-style.png" alt="Party style" className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6">
                  <h4 className="text-2xl font-bold text-black">Party</h4>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden h-64 border-0">
              <CardContent className="p-0 h-full">
                <img src="/images/gym-style.png" alt="Gym style" className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6">
                  <h4 className="text-2xl font-bold text-white">Gym</h4>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-black">OUR HAPPY CUSTOMERS</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold">Sarah M.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to
                  elegant dresses, every piece I've bought has exceeded my expectations."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold">Alex K.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co.
                  The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold">James L.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon
                  Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h3>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white text-black rounded-full px-4 py-3"
              />
              <Button className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-100">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <h4 className="text-2xl font-bold mb-4">SHOP.CO</h4>
              <p className="text-gray-600 text-sm mb-4">
                We have clothes that suits your style and which you're proud to wear. From women to men.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black rounded-full"></div>
                <div className="w-8 h-8 bg-black rounded-full"></div>
                <div className="w-8 h-8 bg-black rounded-full"></div>
                <div className="w-8 h-8 bg-black rounded-full"></div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold mb-4">COMPANY</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Features</li>
                <li>Works</li>
                <li>Career</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">HELP</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Customer Support</li>
                <li>Delivery Details</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">FAQ</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Account</li>
                <li>Manage Deliveries</li>
                <li>Orders</li>
                <li>Payments</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">RESOURCES</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Free eBooks</li>
                <li>Development Tutorial</li>
                <li>How to - Blog</li>
                <li>Youtube Playlist</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">Shop.co © 2000-2023, All Rights Reserved</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="w-12 h-8 bg-gray-300 rounded"></div>
              <div className="w-12 h-8 bg-gray-300 rounded"></div>
              <div className="w-12 h-8 bg-gray-300 rounded"></div>
              <div className="w-12 h-8 bg-gray-300 rounded"></div>
              <div className="w-12 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
