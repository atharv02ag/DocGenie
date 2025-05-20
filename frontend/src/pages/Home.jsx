import "./Home.css";
import { BarChart2, FileText, HelpCircle, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";



export default function Home() {

    const [LoggedIn, setLoggedIn] = useState(0);
    const [profilePic, setProfilePic] = useState('');

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
            );

            console.log(userInfo.data);
            localStorage.setItem("user", JSON.stringify(userInfo.data));
            localStorage.setItem("access_token", tokenResponse.access_token);

            setProfilePic(userInfo.data.picture);
            setLoggedIn(1);
        },
        onError: errorResponse => console.log(errorResponse),
    });

    const handleLogout = ()=>{
        googleLogout();
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        setLoggedIn(0);
        setProfilePic('');
    }


    const avatarTag = (pictureSrc)=>{
        return(
            <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="w-8 h-8 cursor-pointer">
                    <AvatarImage src={pictureSrc} />
                </Avatar>
             </DropdownMenuTrigger>
             <DropdownMenuContent>
                 <DropdownMenuItem>Profile</DropdownMenuItem>
                 <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
             </DropdownMenuContent>
             </DropdownMenu> 
        )
    }

    const SignInPopup = 
        (<Dialog>
        <DialogTrigger className="start-button">Get Started!</DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Please sign in with your Google Account!</DialogTitle>
            <DialogDescription>
                Don't Worry, we won't spam your inbox. Your data is secured.
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
        </Dialog>);

    useEffect(()=>{
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("access_token");

        if (savedUser && savedToken) {
            const userInfoData = JSON.parse(savedUser);
            setProfilePic(userInfoData.picture);
            setLoggedIn(1);
        }
        else{
            setProfilePic('');
            setLoggedIn(0);
        }
    },[]);

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
                        Upload, Analyze, and Interact with Academic Papers — Powered by AI
                    </p>
                    <div className="start-button-wrapper">
                        {(!LoggedIn) ? SignInPopup : <Link to="/Library"><button className="start-button">Get Started!</button></Link>}
                    </div>
                    
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