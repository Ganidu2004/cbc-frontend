import { Route, Routes } from "react-router-dom";
import Header from "../components/common/Header";
import LoginPage from "./logingPage";
import ProductOverview from "./home/productOverview";
import ProductPage from "./home/product";
import Cart from "./home/cart";
import HomeContent from "./home/HomeContent";
import About from "./home/about";
import Contact from "./home/contact";
import Invoice from "./home/invoice";
import Profile from "./home/profile";
import Checkout from "./home/checkout";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-primary relative">
      <Header/>
      <div className="w-full">
        <Routes>
          <Route path="/" element={<HomeContent />}/>
          <Route path="/product" element={<ProductPage/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/invoice/:orderId" element={<Invoice/>}/>
          <Route path="/productInfo/:id" element={<ProductOverview/>}/>
        </Routes>
      </div>
    </div>
  );
}
