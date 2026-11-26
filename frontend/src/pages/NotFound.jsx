import { Link } from "react-router-dom";
import Wordmark from "@/components/Wordmark";

export default function NotFound() {
  return (
    <div className="notfound">
      <Wordmark />
      <p className="notfound-code mono">404</p>
      <h1 className="page-title">This page isn't here.</h1>
      <p className="muted">The link may be broken, or the page may have moved.</p>
      <Link to="/" className="btn btn-secondary mt-6">
        Go to the home page
      </Link>
    </div>
  );
}
