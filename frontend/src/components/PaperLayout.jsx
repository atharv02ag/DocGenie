import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { api, useSessionGuard } from "@/lib/api";
import "./PaperLayout.css";

// Shared frame for /View, /Insight and /Chat. Fetches the paper once and keeps it
// while the user switches between tabs.
export default function PaperLayout() {
  const { id } = useParams();
  const guard = useSessionGuard();
  const [paper, setPaper] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    api(`/api/papers/${id}`)
      .then((data) => {
        if (ignore) return;
        if (!data) return setStatus("missing");
        setPaper(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore || guard(err)) return;
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [id, guard]);

  if (status === "loading") {
    return <div className="page-narrow muted">Loading paper…</div>;
  }
  if (status !== "ready") {
    return (
      <div className="page-narrow">
        <h1 className="page-title">
          {status === "missing" ? "This paper doesn't exist" : "Couldn't load this paper"}
        </h1>
        <p className="muted">
          {status === "missing"
            ? "It may have been deleted by the person who uploaded it."
            : "Check that the server is running and try again."}
        </p>
        <Link to="/Library" className="btn btn-secondary mt-6">
          Back to library
        </Link>
      </div>
    );
  }

  const year = paper.publish_date ? new Date(paper.publish_date).getFullYear() : null;
  const tags = (paper.tags || []).map((t) => t.trim()).filter(Boolean);

  return (
    <div className="paper-page">
      <header className="paper-head">
        <Link to="/Library" className="back-link">
          ← Library
        </Link>
        <h1 className="paper-head-title">{paper.title}</h1>
        <p className="paper-head-meta">
          {paper.authors?.map((a) => a.trim()).join(", ")}
          {year && <span className="mono"> · {year}</span>}
        </p>
        {tags.length > 0 && (
          <ul className="tag-list">
            {tags.map((t) => (
              <li key={t} className="tag">{t}</li>
            ))}
          </ul>
        )}
        <nav className="tabs" aria-label="Paper sections">
          <NavLink to={`/View/${id}`}>Read</NavLink>
          <NavLink to={`/Insight/${id}`}>Summary &amp; review</NavLink>
          <NavLink to={`/Chat/${id}`}>Ask a question</NavLink>
        </nav>
      </header>
      <div className="paper-body">
        <Outlet context={{ paper, id }} />
      </div>
    </div>
  );
}
