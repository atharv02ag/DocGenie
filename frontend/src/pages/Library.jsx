// File: LibraryPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Library.css';

export default function Library() {
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [activeFilter, setActiveFilter] = useState(null);

  const papers = [
    {
      title: 'EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks',
      authors: 'Mingxing Tan, Quoc V. Le',
      year: '2019',
      tags: ['Deep learning']
    },
    {
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      authors: 'Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova',
      year: '2019',
      tags: ['NLP']
    },
    {
      title: 'Attention Is All You Need',
      authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Allan N. Gomez, Lukasz Kaiser, Illia Polosukhin',
      year: '2017',
      tags: ['Transformer', 'Attention']
    },
    {
      title: 'AutoML: A Survey of the State-of-the-Art',
      authors: 'Marc’Aurelio Ranzato, Geoffrey Hinton, Ruslan Salakhutdinov, Oriol Vinyals',
      year: '2016',
      tags: ['Deep learning']
    },
  ];

  const filters = ['Deep learning', 'NLP', 'Transformer', 'Attention'];

  const displayed = papers
    .filter((paper) =>
      (!activeFilter || paper.tags.includes(activeFilter)) &&
      paper.title.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'Title') return a.title.localeCompare(b.title);
      if (sortBy === 'Authors') return a.authors.localeCompare(b.authors);
      return b.year.localeCompare(a.year);
    });

  return (
    <div className="library-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Intelligent Research Paper Management</h2>
        </div>

        <button className="btn upload-btn small-btn">
          <Link to="/Upload" className="label">📤 Upload</Link>
        </button>

        <nav className="nav-links">
          <button className="btn nav-btn active small-btn">
            <span className="label">📚 Library</span>
          </button>
          <button className="btn nav-btn small-btn">
            <Link to="/Insights" className="label">💡 Insights</Link>
          </button>
          <button className="btn nav-btn small-btn">
            <Link to="/Questions" className="label">❓Questions</Link>
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
            <div className="paper-item" key={index}>
              <div className="paper-row">
                <div className="paper-title">{paper.title}</div>
                <div className="paper-authors">{paper.authors}</div>
                <div className="paper-meta">
                  <span className="year">{paper.year}</span>
                  {paper.tags.map((tag) => (
                    <span className="tag-pill" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              {index !== displayed.length - 1 && <hr />}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
