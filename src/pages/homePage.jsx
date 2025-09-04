import { Link } from "react-router-dom";


export default function HomePage() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to My Website</h1>
        <p>Your simple React + Vite homepage</p>
      </header>

      <main className="home-main">
        <button className="home-btn">Get Started</button>
        <button className="home-btn secondary">Learn More</button>
        <Link to="/login">Login</Link> 
      </main>

      <footer className="home-footer">
        <p>© 2025 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
}
