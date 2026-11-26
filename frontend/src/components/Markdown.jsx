import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const plugins = { remark: [remarkMath], rehype: [[rehypeKatex, { throwOnError: false, strict: false }]] };

// Normalise model output before rendering:
// - the summary prompt asks for <br>; raw HTML isn't rendered (so model output can't
//   inject markup), so turn those into paragraph breaks
// - models sometimes write math as \( \) and \[ \] instead of $ / $$
function prepare(text) {
  return (text || "")
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => `\n$$\n${m.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => `$${m.trim()}$`);
}

export default function Markdown({ children }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={plugins.remark} rehypePlugins={plugins.rehype}>
        {prepare(children)}
      </ReactMarkdown>
    </div>
  );
}
