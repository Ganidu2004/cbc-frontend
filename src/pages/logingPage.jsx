import "./logingPages.css";

export default function LoginPage() {
  return (
    <div className="login-container">
      <h1>Login Page</h1>
      <input type="text" placeholder="Enter your username" />
      <input type="password" placeholder="Enter your password" />
      <button>Login</button>
    </div>
  );
}
