import { Link } from "react-router-dom"

export default function ProductCard(props) {
    const { product } = props;
    return (
        <div>
            <Link to={`/productInfo/${product.productId}`}>
                <div className="w-[300px] h-[450px] m-[70px] rounded-xl shadow-lg shadow-gray-500 hover:shadow-primary hover:border-[4px] overflow-hidden flex flex-col">
                    <img
                        src={product.images[0]}
                        className="h-[60%] w-full object-cover "
                        alt={product.productName}
                    />
                    <div className="max-h-[40%] h-[30%] p-3 flex flex-col justify-between">
                        <h1 className="text-3xl font-semibold text-center text-accent">
                            {product.productName}
                        </h1>
                        <h2 className="text-lg text-gray-500 text-center">
                            {product.productId}
                        </h2>
                        <p className="text-xl font-semibold text-left">
                            LKR.{product.lastPrice.toFixed(2)}
                        </p>
                        {product.lastPrice < product.price && (
                            <p className="text-xl font-semibold text-left line-through text-gray-600">
                                LKR.{product.price.toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
