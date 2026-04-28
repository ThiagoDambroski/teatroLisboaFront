import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getAllVideos, type StreamingVideoResponse } from "../api/streamingVideos";
import { getVideoCategories, type VideoCategoryResponse } from "../api/videoCategories";
import { getCollaborators, type CollaboratorResponse } from "../api/collaborators";

export type AgeRating = "L" | "M/3" | "M/6" | "M/12" | "M/14" | "M/16" | "M/18";
export type MoviePrice = number;

export type Collaborator = {
  id: string;
  name: string;
  photoUrl: string;
  functionOnMovie: string;
  socialUrl: string;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  durationMin: number;
  rating: number;
  posterUrl: string;
  description: string;
  ageRating: AgeRating;
  price: MoviePrice;
  createdAt: string;
  isFeatured?: boolean;
  collaborators: Collaborator[];
  embedUrl?: string | null;
  playbackUrl?: string | null;
  uploadStatus?: "DRAFT" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED" | null;
  published?: boolean | null;
};

export type Category = {
  id: string;
  name: string;
  movies: Movie[];
};

type AppContextType = {
  lightBox: boolean;
  toggleLightBox: () => void;

  isAuthenticated: boolean;
  loginMock: () => void;
  logout: () => void;

  categories: Category[];
  getCategoryById: (categoryId: string) => Category | undefined;
  getMoviesByCategoryId: (categoryId: string) => Movie[];
  getMovieById: (movieId: string) => Movie | undefined;

  isLoading: boolean;
};

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const FALLBACK_POSTERS: string[] = [
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1514894786521-31265a5f3b5d?w=900&auto=format&fit=crop&q=60",
];

const FALLBACK_PEOPLE: string[] = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e3e1?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60",
];

function normalizeAgeRating(value: string): AgeRating {
  switch (value) {
    case "L":
      return "L";
    case "M3":
      return "M/3";
    case "M6":
      return "M/6";
    case "M12":
      return "M/12";
    case "M14":
      return "M/14";
    case "M16":
      return "M/16";
    case "M18":
      return "M/18";
    default:
      return "L";
  }
}

function buildCollaboratorMap(collaborators: CollaboratorResponse[]): Map<number, CollaboratorResponse> {
  return new Map(collaborators.map((c) => [c.collaboratorId, c]));
}

function mapMovie(
  video: StreamingVideoResponse,
  collaboratorMap: Map<number, CollaboratorResponse>,
  index: number
): Movie {
  const collaborators: Collaborator[] = (video.collaboratorIds ?? []).map((id, collaboratorIndex) => {
    const collaborator = collaboratorMap.get(id);

    return {
      id: String(id),
      name: collaborator?.name ?? `Colaborador ${id}`,
      photoUrl: FALLBACK_PEOPLE[(index + collaboratorIndex) % FALLBACK_PEOPLE.length],
      functionOnMovie: collaborator?.role ?? "Equipa",
      socialUrl: "#",
    };
  });

  return {
    id: String(video.streamingVideoId),
    title: video.name,
    year: video.year,
    durationMin: video.durationMin ?? 0,
    rating: typeof video.likes === "number" ? Math.max(0, Math.min(10, video.likes / 10)) : 0,
    posterUrl: video.thumbImage?.trim() ? video.thumbImage : FALLBACK_POSTERS[index % FALLBACK_POSTERS.length],
    description: video.synopsis?.trim() ? video.synopsis : "Sem descrição disponível.",
    ageRating: normalizeAgeRating(video.ageRating),
    price: video.price,
    createdAt: new Date().toISOString(),
    isFeatured: index < 5,
    collaborators,
    embedUrl: video.embedUrl,
    playbackUrl: video.playbackUrl,
    uploadStatus: video.uploadStatus,
    published: video.published,
  };
}

function buildCategories(
  videos: StreamingVideoResponse[],
  categoryResponses: VideoCategoryResponse[],
  collaboratorResponses: CollaboratorResponse[]
): Category[] {
  const collaboratorMap = buildCollaboratorMap(collaboratorResponses);
  const movieMap = new Map<string, Movie>();

  videos.forEach((video, index) => {
    movieMap.set(String(video.streamingVideoId), mapMovie(video, collaboratorMap, index));
  });

  const categories: Category[] = categoryResponses.map((category) => {
    const movies = videos
      .filter((video) => video.categoryIds?.includes(category.id))
      .map((video) => movieMap.get(String(video.streamingVideoId)))
      .filter(Boolean) as Movie[];

    return {
      id: String(category.id),
      name: category.name,
      movies,
    };
  });

  const categorizedMovieIds = new Set(
    categories.flatMap((category) => category.movies.map((movie) => movie.id))
  );

  const uncategorizedMovies = videos
    .map((video) => movieMap.get(String(video.streamingVideoId)))
    .filter(Boolean)
    .filter((movie) => !categorizedMovieIds.has(movie!.id)) as Movie[];

  if (uncategorizedMovies.length > 0) {
    categories.push({
      id: "uncategorized",
      name: "Outros",
      movies: uncategorizedMovies,
    });
  }

  if (categories.length === 0) {
    categories.push({
      id: "catalog",
      name: "Catálogo",
      movies: videos.map((video) => movieMap.get(String(video.streamingVideoId))).filter(Boolean) as Movie[],
    });
  }

  return categories;
}

function AppProvider({ children }: AppProviderProps) {
  const [lightBox, setLightBox] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleLightBox = (): void => {
    setLightBox((prev) => !prev);
  };

  const loginMock = (): void => {
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const [videos, categoryResponses, collaboratorResponses] = await Promise.all([
          getAllVideos(),
          getVideoCategories(),
          getCollaborators(),
        ]);

        const readyVideos = videos.filter((video) => {
        if (!video.uploadStatus) return true;
        return video.uploadStatus === "READY";
      });

        const nextCategories = buildCategories(
          readyVideos,
          categoryResponses,
          collaboratorResponses
        );

        if (!active) {
          return;
        }

        setCategories(nextCategories);
      } catch (error) {
        console.error("Failed to load app data", error);

        if (!active) {
          return;
        }

        setCategories([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find((c) => c.id === categoryId);
  };

  const getMoviesByCategoryId = (categoryId: string): Movie[] => {
    return getCategoryById(categoryId)?.movies ?? [];
  };

  const getMovieById = (movieId: string): Movie | undefined => {
    for (const category of categories) {
      const movie = category.movies.find((m) => m.id === movieId);
      if (movie) {
        return movie;
      }
    }

    return undefined;
  };

  const value = useMemo<AppContextType>(() => {
    return {
      lightBox,
      toggleLightBox,
      isAuthenticated,
      loginMock,
      logout,
      categories,
      getCategoryById,
      getMoviesByCategoryId,
      getMovieById,
      isLoading,
    };
  }, [lightBox, isAuthenticated, categories, isLoading]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
}

export default AppProvider;