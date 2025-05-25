import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Insight.css';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

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
                {metaData.summary && (
                <section className="summary-section">
                    <h2>{info.title} Summary</h2>
                    <p>{metaData.summary}</p>
                </section>
                )}
            </main>
        </div>
    );
}
