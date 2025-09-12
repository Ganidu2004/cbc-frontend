import { Link } from "react-router-dom";

export default function Header(){
    return(
        <header className="bg-white w-full h-[100px] relative flex items-center justify-center">
            <img src="/logo.png" className="w-[100px] h-[100px] rounded-full cursor-pointer absolute left-[10px]"/>
            <div className="h-full bg flex items-center w-[500px] justify-evenly">
                <Link to="/" className="text-accent font-bold text-xl hover:border-b border-b-accent">Home</Link>
                <Link to="/" className="text-accent font-bold text-xl hover:border-b border-b-accent">Product</Link>
                <Link to="/" className="text-accent font-bold text-xl hover:border-b border-b-accent">About Us</Link>
                <Link to="/" className="text-accent font-bold text-xl hover:border-b border-b-accent">Contact</Link>
            </div>
            
        </header>
    )
}