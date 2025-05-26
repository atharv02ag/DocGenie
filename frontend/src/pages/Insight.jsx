import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Insight.css';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Insight({setErrorCode, setErrorMsg, errorCode}) {

    const {id} = useParams();
    const [metaData, setMetaData] = useState('');
    const [info, setinfo] = useState('');
    const navigate = useNavigate();

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
                setinfo(item);
            }catch(err){
                setErrorMsg(err.message);
                setinfo('');
                navigate('/Error',{replace : true});
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
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                else 
                {
                    setMetaData(item);
                    console.log(item);
                }
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
