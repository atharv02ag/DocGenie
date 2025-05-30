
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Library.css';

const serverURL = import.meta.env.VITE_SERVER_PATH;

export default function Library() {
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [activeFilter, setActiveFilter] = useState(null);
  const [paperDocs, setPaperDocs] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(()=>{
    const fetchData = async()=>{
      const response = await fetch(`${serverURL}/api/papers`,
        {
          method : "GET",
        }
      );
      const data = await response.json();
      const tagSet = new Set();
      const curPaperDocs = data.map((item) => {
        item.tags.forEach(tag => tagSet.add(tag));
        return {
            id : item._id,
            title: item.title,
            tags: item.tags,
            year: new Date(item.publish_date).getFullYear(),
            authors: item.authors.join(', '),
          };
      });
      setPaperDocs(curPaperDocs);
      setFilters(Array.from(tagSet));
    }

    fetchData();

  },[])

  useEffect(()=>{
    const curDisplayed = paperDocs
      .filter((paper) =>
        (!activeFilter || paper.tags.includes(activeFilter)) &&
        paper.title.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'Title') return a.title.localeCompare(b.title);
        if (sortBy === 'Authors') return a.authors.localeCompare(b.authors);
        return b.year - a.year;
      });
    setDisplayed(curDisplayed);
  },[activeFilter,sortBy,paperDocs])

  return (
    <div className="library-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to='/'><h2>DocGenie</h2></Link>
        </div>

        <button className="btn upload-btn small-btn">
          <Link to="/Upload" className="label">📤 Upload</Link>
        </button>

        <nav className="nav-links">
          <button className="btn nav-btn small-btn">
            <span className="label">📚 Library</span>
          </button>
          <button className="btn nav-btn small-btn">
            <Link to="/Profile" className="label">👤 Profile</Link>
          </button>
        </nav>

        <div className="search-filter">
          <label>Search papers</label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search papers"
          />

          <label>Filter by</label>
          <div className="filter-buttons">
            {filters.map((f) => (
              <button
                key={f}
                className={`btn filter-btn small-filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>Library</h1>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Sort by</option>
            <option>Title</option>
            <option>Authors</option>
            <option>Date</option>
          </select>
        </header>
        <div className="column-headers paper-row">
        <div className="column-title">Title</div>
        <div className="column-authors">Authors</div>
        <div className="column-meta">Date / Tags</div>
        </div>

        <section className="paper-list">
          {displayed.map((paper, index) => (
            <Link to={`/View/${paper.id}`}>
            <div className="paper-item" key={index}>
              <div className="paper-row">
                <div className="paper-title">{paper.title}</div>
                <div className="paper-authors">{paper.authors}</div>
                <div className="paper-meta">
                  <span className="year">{paper.year}</span>
                  {paper.tags.map((tag,index) => (
                    <span className="tag-pill" key={index}>{tag}</span>
                  ))}
                </div>
              </div>
              {index !== displayed.length - 1 && <hr />}
            </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
