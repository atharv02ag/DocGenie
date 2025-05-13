import "./Home.css";
import { BarChart2, FileText, HelpCircle, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from 'axios';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {

    const [LoggedIn, setLoggedIn] = useState(0);
    const [profilePic, setProfilePic] = useState('');

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log(tokenResponse);
            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
            );

            console.log(userInfo.data);
            setProfilePic(userInfo.data.picture);
            setLoggedIn(1);
        },
        onError: errorResponse => console.log(errorResponse),
    });

    const avatarTag = (pictureSrc)=>{
        return (<Avatar className="w-8 h-8">
                    <AvatarImage src={pictureSrc} />
                </Avatar>
                );
    }

    return (
        <>
            <div className="app-container">
                <header className="header">
                    <div className="logo">
                        <div className="logo-icon">R</div>
                        <span>LOGO</span>
                    </div>
                    <nav className="nav">
                        <Link to="/">Home</Link>
                        <a href="#">About</a>
                        {(!LoggedIn) ? <a href="#" onClick={googleLogin}>Sign In</a> :
                                        avatarTag(profilePic)}
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