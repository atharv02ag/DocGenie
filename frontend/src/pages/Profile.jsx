import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useSessionGuard } from "@/lib/api";
import { clearSession } from "@/lib/session";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const guard = useSessionGuard();
  const [user, setUser] = useState(null);
  const [papers, setPapers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await api("/api/user");
        if (!me) throw new Error("account not found");
        // a paper id can outlive its paper, so skip ones that come back empty or fail
        const results = await Promise.allSettled(
          (me.papers_shared || []).map((pid) => api(`/api/papers/${pid}`))
        );
        if (ignore) return;
        setUser(me);
        setPapers(
          results
            .filter((r) => r.status === "fulfilled" && r.value)
            .map((r) => ({ id: r.value._id, title: r.value.title, date: r.value.createdAt }))
        );
        setStatus("ready");
      } catch (err) {
        if (ignore || guard(err)) return;
        setStatus("error");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [guard]);

  const deletePaper = async (id) => {
    setDeleting(id);
    setDeleteError("");
    try {
      await api(`/api/papers/${id}`, { method: "DELETE" });
      setPapers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (guard(err)) return;
      setDeleteError(err.message);
    } finally {
      setDeleting(null);
      setConfirming(null);
    }
  };

  const signOut = () => {
    clearSession();
    navigate("/");
  };

  if (status === "loading") return <div className="page muted">Loading profile…</div>;
  if (status === "error") {
    return (
      <div className="page">
        <h1 className="page-title">Couldn't load your profile</h1>
        <p className="muted">Check that the server is running and try again.</p>
      </div>
    );
  }

  return (
    <div className="page page-form">
      <div className="profile-head">
        {user.picture && (
          <img src={user.picture} alt="" className="profile-photo" referrerPolicy="no-referrer" />
        )}
        <div>
          <h1 className="page-title">{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
      </div>

      <section className="profile-section">
        <h2 className="section-title">Your uploads</h2>
        {deleteError && <p className="form-error">Couldn't delete: {deleteError}</p>}
        {papers.length === 0 ? (
          <p className="muted">
            You haven't uploaded anything yet.{" "}
            <Link to="/Upload" className="text-link">Upload a paper</Link>
          </p>
        ) : (
          <ul className="upload-list">
            {papers.map((p) => (
              <li key={p.id} className="upload-item">
                <div className="upload-item-text">
                  <Link to={`/View/${p.id}`} className="upload-item-title">
                    {p.title}
                  </Link>
                  {p.date && (
                    <span className="muted small">
                      Uploaded {new Date(p.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  )}
                </div>
                {confirming === p.id ? (
                  <div className="confirm">
                    <span className="small">Delete for everyone?</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deletePaper(p.id)}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConfirming(null)}
                      disabled={deleting === p.id}
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(p.id)}>
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-section">
        <button className="btn btn-secondary" onClick={signOut}>
          Sign out
        </button>
      </section>
    </div>
  );
}
