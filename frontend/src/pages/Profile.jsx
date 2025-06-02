import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { googleLogout } from "@react-oauth/google";
import './Profile.css';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Profile({ setErrorCode, setErrorMsg, errorCode }) {

  const [user, setUser] = useState({
    name: '',
    email: '',
    picture: '',
  });

  const navigate = useNavigate();

  const [paperList, setPaperList] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = await fetch(`${serverURL}/api/user`, {
          method: "GET",
          headers: {
            "authorization": `bearer ${localStorage.session}`
          }
        });

        if (!userInfo.ok) {
          const data = await userInfo.json();
          if (data.action === 'REAUTHENTICATE') {
            setErrorCode(userInfo.status);
          }
          else {
            setErrorCode(500);
          }
          throw new Error(data.error || 'Server Failed');
        }

        const userInfoJson = await userInfo.json();
        const curUser = {
          name: userInfoJson.name,
          email: userInfoJson.email,
          picture: userInfoJson.picture,
        };

        setUser(curUser);

        if (userInfoJson.papers_shared) {
          for (const paperId of userInfoJson.papers_shared) {
            const response = await fetch(`${serverURL}/api/papers/${paperId}`,
              {
                method: "GET",
                headers: {
                  "authorization": `bearer ${localStorage.session}`,
                },
              }
            );

            if (!response.ok) {
              const data = await response.json();
              if (data.action === 'REAUTHENTICATE') {
                setErrorCode(response.status);
              }
              else {
                setErrorCode(500);
              }
              throw new Error(data.error || 'Server Failed');
            }

            const item = await response.json();

            setPaperList((prev) => {
              const combined = [...prev, { title: item.title, id: item._id }];

              const uniqueById = [
                ...new Map(combined.map(paper => [paper.id, paper])).values()
              ];

              return uniqueById;
            });

          }
        }
      }
      catch (err) {
        setErrorMsg(err.message);
        navigate('/Error', { replace: true });
        console.log(err);
      }

    }

    fetchProfile();
    console.log(paperList);

  }, [])

  const deletePaper = async (paperId)=>{
    const response = await fetch(`${serverURL}/api/papers/${paperId}`, {
      method : "DELETE",
      headers: {
        "authorization": `bearer ${localStorage.session}`,
      },
    });

    console.log(response);

  }

  const handleLogout = ()=>{
    googleLogout();
    localStorage.removeItem("session");
    localStorage.removeItem("user");
    navigate('/');
  }

  return (
    <div className="profile-container">
      <aside className="sidebar">
        <Link to='/'><div className="sidebar-logo">DocGenie</div></Link>
        <nav className="sidebar-nav">
          <Link to="/Library" className="sidebar-link">📚 Library</Link>
          <Link to="/Profile" className="sidebar-link">👤 Profile</Link>
        </nav>
      </aside>

      <div className="main-profile">
        <div className="profile-card">
          <img src={user.picture} alt="Profile" className="profile-avatar" />
          <h2 className="profile-name">{user.name}</h2>
          <p><strong>Email :</strong> &nbsp;{user.email}</p>

          <div className="profile-papers-shared">
            <h3><strong>Papers Shared : {paperList.length === 0 ? "None" : ""}</strong></h3>
            <ul className="profile-papers-list">
              {paperList.map((paper, index) => (
                <li key={index} className="profile-paper-item">
                  {paper.title}
                  <button className="delete-button" onClick={() => deletePaper(paper.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="logout-wrapper">
            <button className="logout-button" onClick={ handleLogout }>Log Out</button>
          </div>
          

        </div>
      </div>

    </div>
  );
}


