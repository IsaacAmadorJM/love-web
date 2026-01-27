import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import PuzzleJigsaw from "./pages/PuzzleJigsaw";
import Fireworks from "./pages/Fireworks";
import Card3d from "./pages/Card3d";
import PhotoFrame from "./components/PhotoFrame";
import ImageModal from "./components/ImageModal";
import UrlBuilder from "./components/UrlBuilder";
// /?x=10&y=10&txt=dsa&img=imageUrl.com

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // helpers con defaults
  const rows = clamp(Number(searchParams.get("x")), 1, 50, 5);
  const cols = clamp(Number(searchParams.get("y")), 1, 50, 7);
  const imageUrl = searchParams.get("img") || "https://a.storyblok.com/f/112937/568x379/b8d91ebdb6/image-2019-02-12.jpg/m/620x0/filters:quality(70)/";
  const text = searchParams.get("txt") || "No puedo imaginar un mundo en el que no estés tú";

  const [gameFinished, setGameFinished] = useState(
    sessionStorage.getItem("gameFinished") === "true"
  );
  const [open, setOpen] = useState(false);

  const handleCloseModal = () => {
    setOpen(false);
    navigate("/fireworks");
  };

  const handleGameFinish = (finish) => {
    sessionStorage.setItem("gameFinished", String(finish));
    setGameFinished(finish);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <PuzzleJigsaw
              handleGameFinish={handleGameFinish}
              imageUrl={imageUrl}
              rows={rows}
              columns={cols}
              openModal={setOpen}
            />

            <PhotoFrame
              imageUrl={imageUrl}
              text={text}
            />

            <ImageModal
              open={open}
              handleClose={handleCloseModal}
              imageUrl={imageUrl}
              title="🎉 Felicidades 🎉"
              description="Dale a ver los fuegos artificiales :)"
              text="El amor es la fuerza más humilde, pero la más poderosa."
            />
          </>
        }
      />

      <Route
        path="/fireworks"
        element={gameFinished ? <Fireworks /> : <Navigate to="/" />}
      />
      <Route
          path="/card"
          element={
            <Card3d path="/model3d/card_eric.glb" imgUrl="southpark.webp" />
          }
      />
      <Route
      path='/crear'
      element={<UrlBuilder/>}
      ></Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

function clamp(value, min, max, def) {
  if (Number.isNaN(value)) return def;
  if (value < min) return def;
  if (value > max) return max;
  return value;
}
