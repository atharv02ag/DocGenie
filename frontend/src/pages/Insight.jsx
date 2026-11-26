import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, useSessionGuard } from "@/lib/api";
import Markdown from "@/components/Markdown";
import "./Insight.css";

// Generating a summary is slow and costs an API call, so keep the request per paper
// for the session. This also stops StrictMode's double effect from firing it twice.
const requests = new Map();

function fetchSummary(id) {
  if (!requests.has(id)) {
    const p = api(`/api/insights/${id}`).then((d) => d.summary);
    p.catch(() => requests.delete(id));
    requests.set(id, p);
  }
  return requests.get(id);
}

export default function Insight() {
  const { id } = useOutletContext();
  const guard = useSessionGuard();
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setError("");
    fetchSummary(id)
      .then((s) => !ignore && setSummary(s))
      .catch((err) => {
        if (ignore || guard(err)) return;
        setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id, guard, attempt]);

  if (error) {
    return (
      <div className="insight-state">
        <p className="insight-state-title">The summary couldn't be generated.</p>
        <p className="muted">{error}</p>
        <button className="btn btn-secondary mt-5" onClick={() => setAttempt((a) => a + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="insight-state">
        <div className="loading-lines" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <p className="insight-state-title">Reading the paper…</p>
        <p className="muted">
          The first summary of a paper usually takes 20–40 seconds. After that it's quicker.
        </p>
      </div>
    );
  }

  return (
    <article className="insight">
      <p className="insight-note">
        Generated from the paper's text. Treat the scores as a second opinion, not a verdict.
      </p>
      <Markdown>{summary}</Markdown>
    </article>
  );
}
