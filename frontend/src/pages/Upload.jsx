import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, X } from "lucide-react";
import { api, useSessionGuard } from "@/lib/api";
import "./Upload.css";

const MAX_MB = 10; // Cloudinary's free plan rejects files over 10 MB

// "a, b ,, c" -> "a,b,c" (the server splits on commas without trimming)
const tidyList = (s) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join(",");

export default function Upload() {
  const navigate = useNavigate();
  const guard = useSessionGuard();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "",
    authors: "",
    publicationDate: "",
    keywords: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setMetadata({ ...metadata, [key]: e.target.value });

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setErrors((e) => ({ ...e, file: "That isn't a PDF." }));
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: `Files must be under ${MAX_MB} MB.` }));
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    setFile(f);
    if (!metadata.title) {
      setMetadata((m) => ({ ...m, title: f.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ") }));
    }
  };

  const validate = () => {
    const e = {};
    if (!file) e.file = "Choose a PDF to upload.";
    if (!metadata.title.trim()) e.title = "Add a title.";
    if (!tidyList(metadata.authors)) e.authors = "Add at least one author.";
    if (!metadata.publicationDate) e.publicationDate = "Add the publication date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "metadata",
      JSON.stringify({
        title: metadata.title.trim(),
        authors: tidyList(metadata.authors),
        publicationDate: metadata.publicationDate,
        keywords: tidyList(metadata.keywords),
      })
    );

    setLoading(true);
    try {
      const data = await api("/api/papers", { method: "POST", body: formData });
      navigate(data?.id ? `/View/${data.id}` : "/Library");
    } catch (err) {
      if (guard(err)) return;
      setSubmitError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page page-form">
      <h1 className="page-title">Upload a paper</h1>
      <p className="muted">
        Papers you upload are visible to everyone in the library. You can delete them from your
        profile.
      </p>

      <form className="upload-form" onSubmit={handleSubmit} noValidate>
        {file ? (
          <div className="file-chip">
            <FileUp size={18} aria-hidden="true" />
            <span className="file-chip-name">{file.name}</span>
            <span className="muted mono">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button type="button" onClick={() => setFile(null)} aria-label="Remove file">
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            className={`dropzone ${dragging ? "is-dragging" : ""} ${errors.file ? "has-error" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files[0])}
            />
            <FileUp size={22} aria-hidden="true" />
            <span>
              <strong>Choose a PDF</strong> or drop it here
            </span>
            <span className="muted small">Up to {MAX_MB} MB</span>
          </label>
        )}
        {errors.file && <p className="field-error">{errors.file}</p>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={metadata.title} onChange={set("title")} />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="authors">Authors</label>
          <input
            id="authors"
            value={metadata.authors}
            onChange={set("authors")}
            placeholder="Ada Lovelace, Alan Turing"
          />
          <p className="field-hint">Separate names with commas.</p>
          {errors.authors && <p className="field-error">{errors.authors}</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="date">Publication date</label>
            <input
              id="date"
              type="date"
              value={metadata.publicationDate}
              onChange={set("publicationDate")}
            />
            {errors.publicationDate && <p className="field-error">{errors.publicationDate}</p>}
          </div>

          <div className="field">
            <label htmlFor="keywords">
              Keywords <span className="muted">(optional)</span>
            </label>
            <input
              id="keywords"
              value={metadata.keywords}
              onChange={set("keywords")}
              placeholder="transformers, NLP"
            />
          </div>
        </div>

        {submitError && <p className="form-error">Upload failed: {submitError}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading…" : "Upload paper"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
