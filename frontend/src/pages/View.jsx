import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './View.css';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function View({setErrorCode,setErrorMsg,errorCode}) {

    const {id} = useParams();
    const [metaData, setMetaData] = useState('');
    const navigate = useNavigate();
    const toolbarPluginInstance = toolbarPlugin();
    const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

    const transform = (slot) => ({
        ...slot,
        Open: () => <></>,
        EnterFullScreen: () => <></>,
        SwitchTheme: () => <></>,
        Print: () => <></>,
    });
    
    useEffect(()=>{
        const fetchData = async()=>{
            try{
                const response = await fetch(`${serverURL}/api/papers/${id}`,
                    {
                        method : "GET",
                        headers : {
                            "authorization" : `bearer ${localStorage.session}`,
                        },
                    }
                );
                
                if(!response.ok){
                    const data = await response.json();
                    if (data.action === 'REAUTHENTICATE') {
                        setErrorCode(response.status);
                    }
                    else{
                        setErrorCode(500);
                    }
                    throw new Error(data.error || 'Server Failed');
                }
                const item = await response.json();
                setMetaData(item);

            }catch(err){
                setErrorMsg(err.message);
                setMetaData('');
                navigate('/Error',{replace : true});
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
                    <Link to={`/View/${id}`} className="sidebar-link">View Paper</Link>
                    <Link to={`/Insight/${id}`} className="sidebar-link">Generate Insights</Link>
                    <Link to={`/Chat/${id}`} className="sidebar-link">Ask Questions</Link>
                </nav>
            </aside>
            <main className="pdf-viewer-container">
                <h1 className="pdf-title">{metaData.title}</h1>
                {metaData ? (
                <div className="rpv-core__viewer pdf-viewer-box">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                        <Viewer
                            fileUrl={metaData.path}
                            plugins={[toolbarPluginInstance]}
                        />
                    </Worker>
                </div>
                ) : (
                <p className="no-pdf-message">No document selected. Please choose a file from the library.</p>
                )}
            </main>
        </div>
    );
}
