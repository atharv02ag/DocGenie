import "./Home.css";
import { BarChart2, FileText, HelpCircle, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
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

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Home() {

    const [LoggedIn, setLoggedIn] = useState(0);
    const [profilePic, setProfilePic] = useState('');

    const googleLogin = useGoogleLogin({
        onSuccess: async ({code}) => {
            try{
                const userInfo = await fetch(`${serverURL}/auth`,{
                    method : "POST",
                    body : JSON.stringify({
                        code : code,
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    },
                });

                if(!userInfo){
                    throw new Error("Login failed")
                }

                const userInfoJson = await userInfo.json();

                console.log(userInfoJson);

                const userData = {
                    username : userInfoJson.username,
                    picture : userInfoJson.picture,
                };

                localStorage.setItem("session", userInfoJson.sessionToken);
                localStorage.setItem("user",JSON.stringify(userData));
                setProfilePic(userInfoJson.picture);
                setLoggedIn(1);
            }
            catch(err){
                console.log(err.message);
            }
            
        },
        onError: errorResponse => console.log(errorResponse),
        flow : 'auth-code',
    });

    const handleLogout = ()=>{
        googleLogout();
        localStorage.removeItem("session");
        localStorage.removeItem("user");
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
        const savedToken = localStorage.getItem("session");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            const userInfoData = JSON.parse(savedUser);
            setProfilePic(userInfoData.picture);
            setLoggedIn(1);
        }
        else{
            googleLogout();
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