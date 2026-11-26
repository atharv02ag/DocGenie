import { useOutletContext } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
// serve the worker from our own bundle so its version always matches pdfjs-dist
import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import "./View.css";

// hide toolbar buttons that don't make sense here
const transform = (slot) => ({
  ...slot,
  Open: () => <></>,
  OpenMenuItem: () => <></>,
  EnterFullScreen: () => <></>,
  EnterFullScreenMenuItem: () => <></>,
  SwitchTheme: () => <></>,
  SwitchThemeMenuItem: () => <></>,
  Print: () => <></>,
  PrintMenuItem: () => <></>,
});

export default function View() {
  const { paper } = useOutletContext();
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  return (
    <div className="reader">
      <Worker workerUrl={workerUrl}>
        <div className="reader-toolbar">
          <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
        </div>
        <div className="reader-doc">
          <Viewer fileUrl={paper.path} plugins={[toolbarPluginInstance]} />
        </div>
      </Worker>
    </div>
  );
}
