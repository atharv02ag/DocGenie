// UploadPage.jsx (JSX)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    authors: '',
    publicationDate: '',
    keywords: '',
  });

  const handleUpload = async() => {
    console.log('Uploading:', file);
    console.log('Metadata:', metadata);
    const formData = new FormData();
    formData.append('file',file);
    const res = await fetch('http://localhost:8000/api/upload',
      {
        method : "POST",
        body : formData,
      }
    )
    console.log(res);
  };

  return (
    <div className="upload-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Intelligent Research Paper Management</div>
        <nav className="sidebar-nav">
          <Link to = "/Library" className="sidebar-link">📚 Library</Link>
          <Link to="/insights" className="sidebar-link">💡 Insights</Link>
          <Link to="/profile" className="sidebar-link">👤 Profile</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">

        {/* Upload Box */}
        <div className="upload-box">
          <h2>Upload Research Paper</h2>

          <div className="form-group">
              <label>Select PDF File</label>
              <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
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
              <label>Authors</label>
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
              <label>Keywords</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
              />
            </div>
          </div>

          <button className="upload-btn" onClick={handleUpload}>Upload & Analyze</button>
        </div>
      </div>
    </div>
  );
}
