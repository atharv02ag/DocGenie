import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Upload.css';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Upload({setErrorCode,setErrorMsg, errorCode}) {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    authors: '',
    publicationDate: '',
    keywords: '',
  });

  const [loading, setLoading] = useState(0);
  const navigate = useNavigate();

  const handleUpload = async() => {
    setLoading(1);
    console.log('Uploading:', file);
    console.log('Metadata:', metadata);
    if(!file || !metadata.title || !metadata.authors || !metadata.publicationDate){
      console.log('Fill the form properly');
      setTimeout(()=>{setLoading(0)},1000);
    }
    const formData = new FormData();
    formData.append('file',file);
    formData.append('metadata',JSON.stringify(metadata));
    try{
      const response = await fetch(`${serverURL}/api/papers`,
        {
          method : "POST",
          body : formData,
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
      
      setLoading(0);
    }catch(err){
      setErrorMsg(err.message);
      setLoading(0);
      navigate('/Error',{replace : true});
    }
  };

  return (
    <div className="upload-container">
      <aside className="sidebar">
        <Link to='/'><div className="sidebar-logo">DocGenie</div></Link>
        <nav className="sidebar-nav">
          <Link to = "/Library" className="sidebar-link">📚 Library</Link>
          <Link to="/Profile" className="sidebar-link">👤 Profile</Link>
        </nav>
      </aside>

      <div className="main-content">

        <div className="upload-box">
          <h2>Upload Research Paper</h2>

          <div className="form-group">
              <label>Select PDF File</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Authors (comma seperated)</label>
              <input
                type="text"
                value={metadata.authors}
                onChange={(e) => setMetadata({ ...metadata, authors: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Publication Date</label>
              <input
                type="date"
                value={metadata.publicationDate}
                onChange={(e) => setMetadata({ ...metadata, publicationDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Keywords (comma seperated)</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
              />
            </div>
          </div>
          <div className="upload-btn-wrapper">
              <button className={`upload-btn ${loading ? 'loading' : ''}`} onClick={handleUpload}>{loading ? "Uploading..." : "Upload"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
