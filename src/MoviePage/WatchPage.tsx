import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../Context/AppProvider";
import { useEffect } from "react";

function WatchPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { getMovieById } = useApp();

  const movie = movieId ? getMovieById(movieId) : undefined;

  useEffect(() => {
    if (!movieId) {
      navigate("/");
      return;
    }

    if (!movie) {
      navigate("/");
    }
  }, [movie, movieId, navigate]);

  if (!movie) {
    return null;
  }

  if (movie.uploadStatus !== "READY") {
    return (
      <div style={{ padding: "40px", color: "white", background: "black", height: "100vh" }}>
        Video is still processing...
      </div>
    );
  }

  if (!movie.embedUrl && !movie.playbackUrl) {
    return (
      <div style={{ padding: "40px", color: "white", background: "black", height: "100vh" }}>
        Video not available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "black" }}>
      <iframe
        src={movie.embedUrl ?? movie.playbackUrl ?? ""}
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={movie.title}
      />
    </div>
  );
}

export default WatchPage;