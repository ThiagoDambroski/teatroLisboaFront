import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import vidaIMG from "../assets/A vida é sonho.jpg";
import afolgadoIMG from "../assets/Afogada na tua vergonha.jpg";
import galgarIMG from "../assets/Galgar com tudo por cima de tudo.jpg";
import crimeIMG from "../assets/o-crime-de-aldeia-velha-copy.jpg";
import odeIMG from "../assets/ode-marc3adtima.jpg";

export type AgeRating = "L" | "M/12" | "M/16" | "M/18";
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
  vidaIMG,
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&auto=format&fit=crop&q=60",
  afolgadoIMG,
  galgarIMG,
  crimeIMG,
  odeIMG,
];

const MOCK_PEOPLE: string[] = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e3e1?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&auto=format&fit=crop&q=60",
];

const MOCK_SOCIALS: string[] = [
  "https://instagram.com/teatrolisboa",
  "https://www.linkedin.com/company/teatro-lisboa",
  "https://x.com/teatrolisboa",
  "https://www.behance.net",
  "https://vimeo.com",
];

function makeCollaborator(params: {
  id: string;
  name: string;
  photoIndex: number;
  functionOnMovie: string;
  socialIndex: number;
}): Collaborator {
  return {
    id: params.id,
    name: params.name,
    photoUrl: MOCK_PEOPLE[params.photoIndex % MOCK_PEOPLE.length],
    functionOnMovie: params.functionOnMovie,
    socialUrl: MOCK_SOCIALS[params.socialIndex % MOCK_SOCIALS.length],
  };
}

function makeCollaboratorsForMovie(seed: number): Collaborator[] {
  const base = seed * 7;
  return [
    makeCollaborator({
      id: `c-${seed}-01`,
      name: "Inês Ribeiro",
      photoIndex: base + 0,
      functionOnMovie: "Direção",
      socialIndex: base + 0,
    }),
    makeCollaborator({
      id: `c-${seed}-02`,
      name: "Tomás Almeida",
      photoIndex: base + 1,
      functionOnMovie: "Interpretação",
      socialIndex: base + 1,
    }),
    makeCollaborator({
      id: `c-${seed}-03`,
      name: "Marta Correia",
      photoIndex: base + 2,
      functionOnMovie: "Cenografia",
      socialIndex: base + 2,
    }),
    makeCollaborator({
      id: `c-${seed}-04`,
      name: "Bruno Santos",
      photoIndex: base + 3,
      functionOnMovie: "Direção de fotografia",
      socialIndex: base + 3,
    }),
  ];
}

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
  collaboratorsSeed: number;
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
    collaborators: makeCollaboratorsForMovie(params.collaboratorsSeed),
  };
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-drama",
    name: "Drama",
    movies: [
      makeMovie({
        id: "m-016",
        title: "A vida é sonho",
        year: 2023,
        durationMin: 124,
        rating: 8.2,
        posterIndex: 5,
        description: "A director returns home to rebuild what broke.",
        ageRating: "M/16",
        price: 9,
        createdAt: "2026-01-30T11:20:00.000Z",
        isFeatured: true,
        collaboratorsSeed: 16,
      }),
      makeMovie({
        id: "m-017",
        title: "Afogada na tua vergonha",
        year: 2021,
        durationMin: 107,
        rating: 7.7,
        posterIndex: 7,
        description: "Two siblings redefine family after a loss.",
        ageRating: "M/12",
        price: 9,
        createdAt: "2026-01-11T10:00:00.000Z",
        isFeatured: true,
        collaboratorsSeed: 17,
      }),
      makeMovie({
        id: "m-018",
        title: "Galgar com tudo por cima de tudo",
        year: 2022,
        durationMin: 113,
        rating: 7.9,
        posterIndex: 8,
        description: "A playwright confronts the story behind the story.",
        ageRating: "M/16",
        price: 9,
        createdAt: "2026-01-20T10:00:00.000Z",
        isFeatured: true,
        collaboratorsSeed: 18,
      }),
      makeMovie({
        id: "m-019",
        title: "o crime de aldeia velha",
        year: 2020,
        durationMin: 96,
        rating: 7.4,
        posterIndex: 9,
        description: "A friendship tested by fame and distance.",
        ageRating: "M/16",
        price: 9,
        createdAt: "2026-01-04T10:00:00.000Z",
        isFeatured: true,
        collaboratorsSeed: 19,
      }),
      makeMovie({
        id: "m-020",
        title: "Ode maritima",
        year: 2024,
        durationMin: 118,
        rating: 8.1,
        posterIndex: 10,
        description: "A new beginning hidden inside an old routine.",
        ageRating: "M/12",
        price: 9,
        createdAt: "2026-02-08T09:30:00.000Z",
        isFeatured: true,
        collaboratorsSeed: 20,
      }),
    ],
  },
  {
    id: "cat-soon",
    name: "Brevemente disponível",
    movies: [],
  },
];

function AppProvider({ children }: AppProviderProps) {
  const [lightBox, setLightBox] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const toggleLightBox = (): void => {
    setLightBox((prev) => !prev);
  };

  const loginMock = (): void => {
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    setIsAuthenticated(false);
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
        isAuthenticated,
        loginMock,
        logout,
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