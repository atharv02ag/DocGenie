import { Link } from "react-router-dom";

export default function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="DocGenie home">
      Doc<em>Genie</em>
    </Link>
  );
}
