export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-teal-400 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Our App 🚀
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          This is your homepage. From here you can navigate to Login or Sign Up
          and start exploring.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Login
          </a>
          <a
            href="/signin"
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
