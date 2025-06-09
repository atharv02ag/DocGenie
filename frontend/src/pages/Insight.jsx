import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Insight.css';
import { marked } from 'marked';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Insight({ setErrorCode, setErrorMsg, errorCode }) {

    const { id } = useParams();
    const [metaData, setMetaData] = useState('');
    const [info, setinfo] = useState('');
    const [chatPrompt, setChatPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${serverURL}/api/papers/${id}`, {
                    method: "GET",
                    headers: {
                        "authorization": `bearer ${localStorage.session}`,
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    if (data.action === 'REAUTHENTICATE') {
                        setErrorCode(response.status);
                    } else {
                        setErrorCode(500);
                    }
                    throw new Error(data.error || 'Server Failed');
                }

                const item = await response.json();
                setinfo(item);
            } catch (err) {
                setErrorMsg(err.message);
                setinfo('');
                navigate('/Error', { replace: true });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${serverURL}/api/insights/${id}`, {
                    method: "GET",
                    headers: {
                        "authorization": `bearer ${localStorage.session}`,
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    if (data.action === 'REAUTHENTICATE') {
                        setErrorCode(response.status);
                    } else {
                        setErrorCode(500);
                    }
                    throw new Error(data.error || 'Server Failed');
                }

                const item = await response.json();
                setMetaData(item);
            } catch (err) {
                setErrorMsg(err.message);
                setMetaData('');
                navigate('/Error', { replace: true });
            }
        };
        fetchData();
    }, []);

    const handleChat = async () => {
        if (!chatPrompt.trim()) return;

        try {
            const response = await fetch(`${serverURL}/api/insights/chat/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `bearer ${localStorage.session}`,
                },
                body: JSON.stringify({ prompt: chatPrompt }),
            });

            const data = await response.json();
            setChatHistory(prev => [...prev, { question: chatPrompt, answer: data.response }]);
            setChatPrompt('');
        } catch (err) {
            console.error("Chat request failed:", err);
        }
    };

    return (
        <div className="view-container">
            <aside className="sidebar">
                <Link to='/'><div className="sidebar-logo">DocGenie</div></Link>
                <nav className="sidebar-nav">
                    <Link to="/Library" className="sidebar-link">📚 Library</Link>
                    <Link to="/Profile" className="sidebar-link">👤 Profile</Link>
                    <Link to={`/Insight/${id}`} className="sidebar-link">Generate Insights</Link>
                </nav>
            </aside>
            <main className="insight-main">
                {!metaData && (
                    <section className="summary-section">
                        <h2>Fetching Insights...</h2>
                    </section>
                )}
                {metaData.summary && (
                    <section className="summary-section">
                        <h2>{info.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(metaData.summary) }} />
                    </section>
                )}

                <section className="chat-section">
                    <h3>Ask questions about this paper:</h3>
                    <div className="chat-box">
                        {chatHistory.map((item, index) => (
                            <div key={index}>
                                <strong>You:</strong> {item.question}<br />
                                <strong>AI:</strong> {item.answer}<br /><br />
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        placeholder="Ask something..."
                    />
                    <button onClick={handleChat}>Send</button>
                </section>
            </main>
        </div>
    );
}
