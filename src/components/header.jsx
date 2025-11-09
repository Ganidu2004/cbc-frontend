import { Link } from "react-router-dom";

export default function Header(){
    return(
        <header className=" bg-white w-full h-[100px] relative flex items-center justify-between shadow-md px-5">
            
            <img src="/logo.png" className="w-[100px] h-[100px] rounded-full cursor-pointer"/>

            <div className="flex gap-8">
                <Link to="/" className="text-accent font-bold text-xl hover:border-b border-b-accent">Home</Link>
                <Link to="/product" className="text-accent font-bold text-xl hover:border-b border-b-accent">Product</Link>
                <Link to="/about" className="text-accent font-bold text-xl hover:border-b border-b-accent">About Us</Link>
                <Link to="/contact" className="text-accent font-bold text-xl hover:border-b border-b-accent">Contact</Link>
                <Link to="/cart" className="text-accent font-bold text-xl hover:border-b border-b-accent">Cart</Link>
            </div>

            <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="border border-accent text-accent font-semibold px-4 py-2 rounded-xl hover:bg-accent hover:text-white transition">
                    Login
                </Link>

                <Link 
                  to="/singin" 
                  className="bg-accent text-white font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition">
                    Register
                </Link>
            </div>

        </header>
    )
}
