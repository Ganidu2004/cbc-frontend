export default function ProductNotFound(){
    return(
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">Product Not Found</h1>
      <p className="text-gray-500 mb-6">
        Sorry, the product you are looking for does not exist or has been removed.
      </p>
      <a href="/products" className="px-6 py-3 bg-accent text-white rounded-2xl shadow hover:bg-accent/90 transition">
        Back to Products
      </a>
    </div>
    )
}