import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api, useSessionGuard } from "@/lib/api";
import "./Library.css";

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => b.date - a.date },
  oldest: { label: "Oldest first", fn: (a, b) => a.date - b.date },
  title: { label: "Title A–Z", fn: (a, b) => a.title.localeCompare(b.title) },
  authors: { label: "Author A–Z", fn: (a, b) => a.authors.localeCompare(b.authors) },
};

const clean = (list) => (list || []).map((s) => s.trim()).filter(Boolean);

export default function Library() {
  const guard = useSessionGuard();
  const [papers, setPapers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let ignore = false;
    api("/api/papers")
      .then((data) => {
        if (ignore) return;
        setPapers(
          data.map((p) => ({
            id: p._id,
            title: p.title,
            authors: clean(p.authors).join(", "),
            tags: clean(p.tags),
            date: new Date(p.publish_date),
          }))
        );
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore || guard(err)) return;
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [guard]);

  const tags = useMemo(() => {
    const counts = new Map();
    papers.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [papers]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return papers
      .filter((p) => !activeTag || p.tags.includes(activeTag))
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort(SORTS[sortBy].fn);
  }, [papers, search, sortBy, activeTag]);

  return (
    <div className="page">
      <div className="library-head">
        <div>
          <h1 className="page-title">Library</h1>
          {status === "ready" && (
            <p className="muted">
              {papers.length} {papers.length === 1 ? "paper" : "papers"} shared by everyone on DocGenie
            </p>
          )}
        </div>
        <Link to="/Upload" className="btn btn-primary">
          Upload a paper
        </Link>
      </div>

      <div className="library-controls">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, authors, keywords"
            aria-label="Search papers"
          />
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort papers"
          className="select"
        >
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div className="tag-filter" role="group" aria-label="Filter by keyword">
          {tags.map((t) => (
            <button
              key={t}
              className={`tag tag-button ${activeTag === t ? "is-active" : ""}`}
              aria-pressed={activeTag === t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {status === "loading" && <p className="muted list-state">Loading papers…</p>}
      {status === "error" && (
        <p className="list-state error-text">
          Couldn't load the library. Is the server running?
        </p>
      )}
      {status === "ready" && papers.length === 0 && (
        <div className="list-state">
          <p>Nothing here yet.</p>
          <p className="muted">
            <Link to="/Upload" className="text-link">Upload the first paper</Link> to get started.
          </p>
        </div>
      )}
      {status === "ready" && papers.length > 0 && shown.length === 0 && (
        <p className="muted list-state">No papers match your search.</p>
      )}

      {shown.length > 0 && (
        <ol className="paper-list">
          {shown.map((p) => (
            <li key={p.id}>
              <Link to={`/View/${p.id}`} className="paper-row">
                <div className="paper-row-main">
                  <h2 className="paper-row-title">{p.title}</h2>
                  <p className="paper-row-authors">{p.authors}</p>
                  {p.tags.length > 0 && (
                    <ul className="paper-row-tags">
                      {p.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="paper-row-year mono">
                  {isNaN(p.date) ? "—" : p.date.getFullYear()}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
