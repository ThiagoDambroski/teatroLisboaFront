import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AgeRating = "L" | "M/12" | "M/16" | "M/18";
export type MoviePrice = 10 | 20 | 30 | 40;

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
};

export type Category = {
  id: string;
  name: string;
  movies: Movie[];
};

type AppContextType = {
  lightBox: boolean;
  toggleLightBox: () => void;

  categories: Category[];
  getCategoryById: (categoryId: string) => Category | undefined;
  getMoviesByCategoryId: (categoryId: string) => Movie[];
  getMovieById: (movieId: string) => Movie | undefined;
};

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_POSTERS: string[] = [
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1514894786521-31265a5f3b5d?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=900&auto=format&fit=crop&q=60",
];

function makeMovie(params: {
  id: string;
  title: string;
  year: number;
  durationMin: number;
  rating: number;
  posterIndex: number;
  description: string;
  ageRating: AgeRating;
  price: MoviePrice;
  createdAt: string;
  isFeatured?: boolean;
}): Movie {
  return {
    id: params.id,
    title: params.title,
    year: params.year,
    durationMin: params.durationMin,
    rating: params.rating,
    posterUrl: MOCK_POSTERS[params.posterIndex % MOCK_POSTERS.length],
    description: params.description,
    ageRating: params.ageRating,
    price: params.price,
    createdAt: params.createdAt,
    isFeatured: params.isFeatured,
  };
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-action",
    name: "Ação",
    movies: [
      makeMovie({
        id: "m-001",
        title: "Midnight Circuit",
        year: 2023,
        durationMin: 112,
        rating: 8.1,
        posterIndex: 0,
        description: "A hacker chase turns into a city-wide blackout.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-28T10:10:00.000Z",
        isFeatured: true,
      }),
      makeMovie({
        id: "m-002",
        title: "Neon Harbor",
        year: 2024,
        durationMin: 104,
        rating: 7.7,
        posterIndex: 1,
        description: "A dockworker finds a hidden tape that changes everything.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-02-02T09:40:00.000Z",
      }),
      makeMovie({
        id: "m-003",
        title: "Afterglow Protocol",
        year: 2024,
        durationMin: 126,
        rating: 8.3,
        posterIndex: 3,
        description: "A covert team races a countdown nobody can stop.",
        ageRating: "M/16",
        price: 30,
        createdAt: "2026-02-06T14:20:00.000Z",
        isFeatured: true,
      }),
      makeMovie({
        id: "m-004",
        title: "Glass Horizon",
        year: 2021,
        durationMin: 98,
        rating: 7.4,
        posterIndex: 4,
        description: "A desperate heist under the glare of a perfect skyline.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-05T11:00:00.000Z",
      }),
      makeMovie({
        id: "m-005",
        title: "Cold Signal",
        year: 2023,
        durationMin: 123,
        rating: 7.9,
        posterIndex: 2,
        description: "A radio operator hears a message from tomorrow.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-22T08:35:00.000Z",
      }),
    ],
  },
  {
    id: "cat-adventure",
    name: "Aventura",
    movies: [
      makeMovie({
        id: "m-006",
        title: "Redline District",
        year: 2024,
        durationMin: 115,
        rating: 8.0,
        posterIndex: 2,
        description: "A courier runs a route no one survives twice.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-02-07T10:00:00.000Z",
        isFeatured: true,
      }),
      makeMovie({
        id: "m-007",
        title: "The Black Gate",
        year: 2020,
        durationMin: 132,
        rating: 7.6,
        posterIndex: 0,
        description: "A fortress raid reveals a secret beneath the walls.",
        ageRating: "M/16",
        price: 30,
        createdAt: "2026-01-01T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-008",
        title: "Nightfall Run",
        year: 2021,
        durationMin: 99,
        rating: 7.3,
        posterIndex: 1,
        description: "One car. One city. One impossible escape.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-08T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-009",
        title: "Iron Vow",
        year: 2022,
        durationMin: 108,
        rating: 7.5,
        posterIndex: 3,
        description: "A bodyguard breaks the rules for the right reason.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-12T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-010",
        title: "Silent Meridian",
        year: 2022,
        durationMin: 119,
        rating: 7.9,
        posterIndex: 4,
        description: "A lost signal pulls a journalist into a conspiracy.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-15T10:00:00.000Z",
      }),
    ],
  },
  {
    id: "cat-comedy",
    name: "Comédia",
    movies: [
      makeMovie({
        id: "m-011",
        title: "Queue Jumpers",
        year: 2024,
        durationMin: 97,
        rating: 7.2,
        posterIndex: 8,
        description: "Two rivals fake friendship for a prize they both want.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-02-01T12:10:00.000Z",
      }),
      makeMovie({
        id: "m-012",
        title: "Stage Left",
        year: 2022,
        durationMin: 101,
        rating: 7.3,
        posterIndex: 5,
        description: "An actor improvises his way out of disaster.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-18T09:00:00.000Z",
      }),
      makeMovie({
        id: "m-013",
        title: "Apartment Encore",
        year: 2020,
        durationMin: 99,
        rating: 7.1,
        posterIndex: 7,
        description: "Neighbors create chaos trying to be helpful.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-03T18:00:00.000Z",
      }),
      makeMovie({
        id: "m-014",
        title: "Late Ticket",
        year: 2021,
        durationMin: 93,
        rating: 7.0,
        posterIndex: 6,
        description: "A man misses a show and finds a new life backstage.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-09T12:00:00.000Z",
      }),
      makeMovie({
        id: "m-015",
        title: "The Stand-In",
        year: 2023,
        durationMin: 105,
        rating: 7.4,
        posterIndex: 9,
        description: "A stunt double gets cast by accident—and nails it.",
        ageRating: "M/12",
        price: 20,
        createdAt: "2026-01-25T16:00:00.000Z",
        isFeatured: true,
      }),
    ],
  },
  {
    id: "cat-drama",
    name: "Drama",
    movies: [
      makeMovie({
        id: "m-016",
        title: "Second Act",
        year: 2023,
        durationMin: 124,
        rating: 8.2,
        posterIndex: 6,
        description: "A director returns home to rebuild what broke.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-30T11:20:00.000Z",
        isFeatured: true,
      }),
      makeMovie({
        id: "m-017",
        title: "Salt & Rose",
        year: 2021,
        durationMin: 107,
        rating: 7.7,
        posterIndex: 7,
        description: "Two siblings redefine family after a loss.",
        ageRating: "M/12",
        price: 10,
        createdAt: "2026-01-11T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-018",
        title: "The Quiet Seat",
        year: 2022,
        durationMin: 113,
        rating: 7.9,
        posterIndex: 8,
        description: "A playwright confronts the story behind the story.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-20T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-019",
        title: "Blue Hour",
        year: 2020,
        durationMin: 96,
        rating: 7.4,
        posterIndex: 9,
        description: "A friendship tested by fame and distance.",
        ageRating: "M/16",
        price: 20,
        createdAt: "2026-01-04T10:00:00.000Z",
      }),
      makeMovie({
        id: "m-020",
        title: "Small Lights",
        year: 2024,
        durationMin: 118,
        rating: 8.1,
        posterIndex: 5,
        description: "A new beginning hidden inside an old routine.",
        ageRating: "M/12",
        price: 20,
        createdAt: "2026-02-08T09:30:00.000Z",
        isFeatured: true,
      }),
    ],
  },
  {
    id: "cat-horror",
    name: "Terror",
    movies: [
      makeMovie({
        id: "m-021",
        title: "Hollow Frame",
        year: 2022,
        durationMin: 101,
        rating: 7.2,
        posterIndex: 4,
        description: "A forgotten film reel brings back something alive.",
        ageRating: "M/18",
        price: 30,
        createdAt: "2026-01-16T22:10:00.000Z",
      }),
      makeMovie({
        id: "m-022",
        title: "Red Curtain",
        year: 2023,
        durationMin: 109,
        rating: 7.6,
        posterIndex: 1,
        description: "A theater’s old stage holds a new secret.",
        ageRating: "M/18",
        price: 40,
        createdAt: "2026-01-27T19:10:00.000Z",
        isFeatured: true,
      }),
      makeMovie({
        id: "m-023",
        title: "The Audience",
        year: 2021,
        durationMin: 97,
        rating: 7.1,
        posterIndex: 2,
        description: "They clap… but nobody’s there.",
        ageRating: "M/18",
        price: 30,
        createdAt: "2026-01-07T19:10:00.000Z",
      }),
      makeMovie({
        id: "m-024",
        title: "Backstage Noise",
        year: 2020,
        durationMin: 92,
        rating: 6.9,
        posterIndex: 3,
        description: "The whispers get louder when the lights go out.",
        ageRating: "M/18",
        price: 30,
        createdAt: "2026-01-02T19:10:00.000Z",
      }),
      makeMovie({
        id: "m-025",
        title: "Exit Sign",
        year: 2024,
        durationMin: 104,
        rating: 7.8,
        posterIndex: 0,
        description: "The exit moves every time you look away.",
        ageRating: "M/18",
        price: 40,
        createdAt: "2026-02-05T19:10:00.000Z",
        isFeatured: true,
      }),
    ],
  },
];

function AppProvider({ children }: AppProviderProps) {
  const [lightBox, setLightBox] = useState<boolean>(false);

  const toggleLightBox = (): void => {
    setLightBox((prev) => !prev);
  };

  const categories = useMemo<Category[]>(() => MOCK_CATEGORIES, []);

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find((c) => c.id === categoryId);
  };

  const getMoviesByCategoryId = (categoryId: string): Movie[] => {
    return getCategoryById(categoryId)?.movies ?? [];
  };

  const getMovieById = (movieId: string): Movie | undefined => {
    for (const c of categories) {
      const movie = c.movies.find((m) => m.id === movieId);
      if (movie) return movie;
    }
    return undefined;
  };

  return (
    <AppContext.Provider
      value={{
        lightBox,
        toggleLightBox,
        categories,
        getCategoryById,
        getMoviesByCategoryId,
        getMovieById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

export default AppProvider;
