import { useState } from "react";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";

export const MainView = () => {
    const [movies, setMovies] = useState([
        {   id: 1,  
            title: "Palmer",
              description: "An ex-convict strikes up a friendship with a boy from a troubled home.",
              image: "https://de.web.img3.acsta.net/pictures/20/12/18/10/24/4751126.jpg",
              genre: "Drama",
              director: "Fisher Stevens"

        },
        {   id: 2,  
            title: "Dunkirk",
              description: "Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.",
              image: "https://m.media-amazon.com/images/M/MV5BN2YyZjQ0NTEtNzU5MS00NGZkLTg0MTEtYzJmMWY3MWRhZjM2XkEyXkFqcGdeQXVyMDA4NzMyOA@@._V1_.jpg",
              genre: "Historical drama",
              director: "Christopher Nolan"

        },
        {   id: 3,  
            title: "Forrest Gum",
              description: "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
              image: 'https://static.kino.de/wp-content/uploads/2019/10/forrest-gump-1994-filmplakat.jpg',
              genre: "Drama",
              director: "Robert Zemeckis"

        }
    ])

    const [selectedMovie, setSelectedMovie] = useState(null)

    if (selectedMovie) {
        return(
            <MovieView movie={selectedMovie} onBackClick={()=> setSelectedMovie(null)}/>
        )
    }

    if (movies.length === 0){
        return <div>The list is empty!</div>
    }

    return (
        <div>
            {movies.map((movie) => {
                return (
                    <MovieCard key = {movie.id} movieData = {movie} onMovieClick = {(newSelectedMovie) => setSelectedMovie(newSelectedMovie)}/>

                )
            } )}
        </div>
    )
}