import { Route, Routes } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
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
import OrderTracking from "./home/orderTracking";
import TrackTimeline from "./home/trackTimeline";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-primary relative flex flex-col justify-between">
      <Header/>
      <div className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<HomeContent />}/>
          <Route path="/product" element={<ProductPage/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/track-order" element={<OrderTracking/>}/>
          <Route path="/track-timeline/:orderId" element={<TrackTimeline/>}/>
          <Route path="/invoice/:orderId" element={<Invoice/>}/>
          <Route path="/productInfo/:id" element={<ProductOverview/>}/>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

