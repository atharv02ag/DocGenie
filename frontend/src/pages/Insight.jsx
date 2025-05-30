import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import './Insight.css';
import ReactMarkdown from "react-markdown";

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Insight() {

    const {id} = useParams();
    const [metaData, setMetaData] = useState('');
    const [info, setinfo] = useState('');

    useEffect(()=>{
        const fetchData = async()=>{
            try{
                const response = await fetch(`${serverURL}/api/papers/${id}`,
                    {
                        method : "GET",
                    }
                );
                const item = await response.json();
                setinfo(item);
            }catch(err){
                console.log(err.message);
                setinfo('');
            }
        }
        fetchData();
    },[]);
    

    useEffect(()=>{
        const fetchData = async()=>{
            try{
                const response = await fetch(`${serverURL}/api/insights/${id}`,
                    {
                        method : "GET",
                    }
                );
                const item = await response.json();
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                else 
                {
                    setMetaData(item);
                    console.log(item);
                }
            }catch(err){
                console.log(err);
                setMetaData('');
            }
        }
        fetchData();
    },[]);
    return (
        <div className="view-container">
            <aside className="sidebar">
                <Link to='/'><div className="sidebar-logo">DocGenie</div></Link>
                <nav className="sidebar-nav">
                    <Link to = "/Library" className="sidebar-link">📚 Library</Link>
                    <Link to="/Profile" className="sidebar-link">👤 Profile</Link>
                    <Link to={`/Insight/${id}`} className="sidebar-link">Generate Insights</Link>
                </nav>
            </aside>
            <main className="insight-main">
                {!metaData  && (
                <section className="summary-section">
                    <h2>Fetching Insights...</h2>
                </section>
                )}
                {metaData.summary && (
                <section className="summary-section">
                    <h2>{info.title}</h2>
                    {/* <ReactMarkdown>{metaData.summary}</ReactMarkdown> */}
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(metaData.summary)}} />

                </section>
                )}
            </main>
        </div>
    );
}
