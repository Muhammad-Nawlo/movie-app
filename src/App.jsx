import './App.css'
import Search from "./components/Search.jsx";
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_READ_ACCESS_TOKEN;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    }
};

function App() {
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [movies, setMovies] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useDebounce(() => setDebouncedSearch(search), 500, [search]);
    const fetchMovies = async (query) => {
        setIsLoading(true);
        setError("");
        try {
            const endpoint = query ?
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=true`;
            const response = await fetch(endpoint, API_OPTIONS)
            if (!response.ok) {
                throw new Error("Error fetching movie data.");
            }
            const data = await response.json();
            setMovies(() => data.results || [])
            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    const fetchTrendingMovies = async () => {
        try {
            const trendingMovies = await getTrendingMovies()
            setTrendingMovies(trendingMovies)
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        fetchMovies(debouncedSearch);
    }, [debouncedSearch])

    useEffect(() => {
        fetchTrendingMovies();
    })
    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span>You'll Enjoy Without the Hassle</h1>
                    <Search search={search} setSearch={setSearch}/>
                </header>
                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}


                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>

                    {
                        isLoading ? (<Spinner/>) :
                            error ? <p className="text-red-500">{error}</p> :
                                <ul className="text-white">
                                    {
                                        movies.map((movie) =>
                                            <MovieCard key={movie.id} movie={movie}/>)
                                    }
                                </ul>
                    }
                </section>
            </div>
        </main>
    )
}

export default App
