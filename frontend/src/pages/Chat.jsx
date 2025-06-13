import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Chat.css';
import { marked } from 'marked';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Insight({ setErrorCode, setErrorMsg, errorCode }) {

    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(0);

    const handleInputChange = async (e) => {
        setQuestion(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Question submitted:", question);
        try {
            setLoading(1);
            const response = await fetch(`${serverURL}/api/insights/${id}`, {
                method: "POST",
                headers: {
                    "authorization": `bearer ${localStorage.session}`,
                },
                body : question,
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
            console.log(item);
            setAnswer(item.answer);
            setLoading(0);

        } catch (err) {
            setErrorMsg(err.message);
            setAnswer('');
            setQuestion('');
            navigate('/Error', { replace: true });
            setLoading(0);
        }
    };

    return (
        <div className="chat-container">
            <aside className="sidebar">
                <Link to='/'><div className="sidebar-logo">DocGenie</div></Link>
                <nav className="sidebar-nav">
                    <Link to="/Library" className="sidebar-link">📚 Library</Link>
                    <Link to="/Profile" className="sidebar-link">👤 Profile</Link>
                    <Link to={`/View/${id}`} className="sidebar-link">View Paper</Link>
                    <Link to={`/Insight/${id}`} className="sidebar-link">Generate Insights</Link>
                    <Link to={`/Chat/${id}`} className="sidebar-link">Ask Questions</Link>
                </nav>
            </aside>
            
            <div className="pdf-chat-container">
                <h1 className="pdf-chat-heading">Any Questions?</h1>
                <form onSubmit={handleSubmit} className="pdf-chat-form">
                    <input
                    type="text"
                    value={question}
                    onChange={handleInputChange}
                    placeholder="Ask me anything about the paper"
                    className="pdf-chat-input"
                    />
                </form>
                <main className="answer-main">
                    {answer && !loading && (
                        <section className="answer-section">
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(answer) }} />
                        </section>
                    )}
                    {loading ? (
                        <section className="answer-section">
                            Loading answer...
                        </section>
                    ) : ''}
                </main>
            </div>
        </div>
    );
}
