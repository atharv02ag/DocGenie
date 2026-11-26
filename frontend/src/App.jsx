import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Library from "./pages/Library.jsx";
import Upload from "./pages/Upload.jsx";
import View from "./pages/View.jsx";
import Insight from "./pages/Insight.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoutes from "./lib/ProtectedRoutes.jsx";
import AppShell from "./components/AppShell.jsx";
import PaperLayout from "./components/PaperLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppShell />}>
            <Route path="/Library" element={<Library />} />
            <Route path="/Upload" element={<Upload />} />
            <Route path="/Profile" element={<Profile />} />
            <Route element={<PaperLayout />}>
              <Route path="/View/:id" element={<View />} />
              <Route path="/Insight/:id" element={<Insight />} />
              <Route path="/Chat/:id" element={<Chat />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
