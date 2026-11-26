import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import Wordmark from "@/components/Wordmark";
import UserMenu from "@/components/UserMenu";
import { serverURL } from "@/lib/api";
import { getToken, getUser, saveSession } from "@/lib/session";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getToken() && getUser()));
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const notice = location.state?.notice;

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setSigningIn(true);
      setError("");
      try {
        const res = await fetch(`${serverURL}/auth`, {
          method: "POST",
          body: JSON.stringify({ code }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("login failed");

        const data = await res.json();
        saveSession(data.sessionToken, { username: data.username, picture: data.picture });
        setLoggedIn(true);
        navigate("/Library");
      } catch {
        setError("Sign-in didn't go through. Try again in a moment.");
      } finally {
        setSigningIn(false);
      }
    },
    onError: () => setError("Sign-in was cancelled or failed."),
  });

  const cta = loggedIn ? (
    <Link to="/Library" className="btn btn-primary btn-lg">
      Open the library
    </Link>
  ) : (
    <button className="btn btn-primary btn-lg" onClick={() => googleLogin()} disabled={signingIn}>
      {signingIn ? "Signing in…" : "Sign in with Google"}
    </button>
  );

  return (
    <div className="home">
      <header className="home-header">
        <Wordmark />
        <nav className="home-nav">
          <a href="#how">How it works</a>
          {loggedIn ? (
            <>
              <Link to="/Library">Library</Link>
              <UserMenu onSignOut={() => setLoggedIn(false)} />
            </>
          ) : (
            <button className="link-button" onClick={() => googleLogin()}>
              Sign in
            </button>
          )}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Get through the reading list <em>without</em> skimming past what matters.
            </h1>
            <p className="hero-sub">
              Upload a research paper and DocGenie writes a structured summary, gives a frank
              review of the methods, and answers your questions using the paper's own text.
            </p>
            <div className="hero-actions">
              {cta}
              {!loggedIn && <span className="muted small">We only use your Google account to sign you in.</span>}
            </div>
            {notice && !loggedIn && <p className="notice">{notice}</p>}
            {error && <p className="form-error">{error}</p>}
          </div>

          <figure className="specimen" aria-hidden="true">
            <div className="specimen-page">
              <p className="specimen-kicker">arXiv preprint</p>
              <p className="specimen-title">Sparse Attention Holds Up at Long Context Lengths</p>
              <p className="specimen-authors">M. Okafor, L. Brandt, S. Iyer</p>
              <p className="specimen-label">Abstract</p>
              <p className="specimen-text">
                We study whether sparse attention patterns retain accuracy as context grows
                beyond 32k tokens. Across four retrieval benchmarks,{" "}
                <mark>block-sparse models lose under 2% accuracy relative to dense baselines</mark>{" "}
                while using a fraction of the memory. We also find that the choice of
                block size matters more than the sparsity ratio itself…
              </p>
              <div className="specimen-lines">
                <span /><span /><span /><span style={{ width: "62%" }} />
              </div>
            </div>
            <figcaption className="specimen-note">
              <span className="specimen-note-label">Key finding</span>
              Accuracy barely drops with sparsity. Worth checking: only retrieval tasks were tested.
            </figcaption>
          </figure>
        </section>

        <section className="how" id="how">
          <h2>How it works</h2>
          <ol className="how-steps">
            <li>
              <span className="how-num">i.</span>
              <h3>Upload a PDF</h3>
              <p>Add the title, authors and a few keywords so others can find it in the shared library.</p>
            </li>
            <li>
              <span className="how-num">ii.</span>
              <h3>Read the summary</h3>
              <p>
                Get the introduction, findings, methods and conclusions in order, plus scores and
                specific suggestions for improvement.
              </p>
            </li>
            <li>
              <span className="how-num">iii.</span>
              <h3>Ask follow-ups</h3>
              <p>
                Ask about a table, a method or a claim. Answers come from the most relevant passages
                in the paper.
              </p>
            </li>
          </ol>
        </section>
      </main>

      <footer className="home-footer">
        <Wordmark />
        <span className="muted small">Summaries are generated by AI and can be wrong. Check the paper.</span>
      </footer>
    </div>
  );
}
