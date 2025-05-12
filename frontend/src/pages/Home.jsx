import "./Home.css";
import { BarChart2, FileText, HelpCircle, LayoutGrid } from "lucide-react";

export default function Home() {
  return (
    <>
        <div className="app-container">
        <header className="header">
            <div className="logo">
            <div className="logo-icon">R</div>
            <span>LOGO</span>
            </div>
            <nav className="nav">
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">About</a>
            <a href="#">Sign In</a>
            </nav>
        </header>

        <main className="main">
            <h1 className="main-title">
            Revolutionize the Way <br /> You Read Research
            </h1>
            <p className="main-subtitle">
            Upload, Analyze, and Interact with Academic Papers—Powered by AI
            </p>
            <button className="start-button">Get Started</button>

            <div className="features">
            <div className="feature-card">
                <FileText className="icon" />
                <span>Smart Uploads</span>
            </div>
            <div className="feature-card">
                <BarChart2 className="icon" />
                <span>Instant Insights</span>
            </div>
            <div className="feature-card">
                <HelpCircle className="icon" />
                <span>Ask Anything</span>
            </div>
            <div className="feature-card">
                <LayoutGrid className="icon" />
                <span>Organize Easily</span>
            </div>
            </div>

            <section className="how-it-works">
            <h2>How It Works</h2>
            <div className="steps">
                <div className="step">
                <div className="step-number">1</div>
                <p>Upload your PDFs</p>
                </div>
                <div className="step">
                <div className="step-number">2</div>
                <p>Let AI analyze and summarize</p>
                </div>
                <div className="step">
                <div className="step-number">3</div>
                <p>Search, interact, and ask questions</p>
                </div>
            </div>
            </section>
        </main>

        <footer className="footer">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
        </footer>
        </div>
    </>
    
  );
}