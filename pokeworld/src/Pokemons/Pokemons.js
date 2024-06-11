import React, { useEffect, useState } from 'react';
import axios from 'axios';




const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const URI = 'https://localhost:7208/comments'

const Pokemons = () => {
    const [pokemonData, setPokemonData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextUrl, setNextUrl] = useState('https://pokeapi.co/api/v2/pokemon?offset=0&limit=18');
    const [searchPokemon, setSearchPokemon] = useState('')
    const [filteredPokemon, setFilteredPokemon] = useState(pokemonData);


    useEffect(() => {
        setFilteredPokemon(
            searchPokemon
                ? pokemonData.filter(pokemon =>
                    pokemon.name.toLowerCase().includes(searchPokemon.toLowerCase())
                )
                : pokemonData
        );
    }, [searchPokemon, pokemonData]);


    useEffect(() => {
        fetchPokemonDetails(nextUrl);
        // eslint-disable-next-line
    }, []);


    const fetchPokemonDetails = async (url) => {
        setLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch Pokémon');
            }
            const data = await response.json();
            const promises = data.results.map(async (pokemon) => {
                const pokemonResponse = await fetch(pokemon.url);
                if (!pokemonResponse.ok) {
                    throw new Error(`Failed to fetch details for ${pokemon.name}`);
                }
                const pokemonDetails = await pokemonResponse.json();
                pokemonDetails.name = capitalizeFirstLetter(pokemonDetails.name);
                return pokemonDetails;
            });
            const pokemonDetails = await Promise.all(promises);
            setPokemonData(prevData => [...prevData, ...pokemonDetails]);
            setNextUrl(data.next);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchMore = () => {
        if (nextUrl) {
            fetchPokemonDetails(nextUrl);
        }
    };


    return (
        <div className='flex flex-col items-center mt-5 mb-12'>
            <input type='text' placeholder='Search Pokemon' className='pl-1 border-2 border-black bg-blue-500 text-white rounded w-56 h-8 text-2xl' onChange={e => setSearchPokemon(e.target.value)} />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredPokemon.map((pokemon) => {
                    return (
                        <div className='flex flex-col items-center' key={pokemon.id}>
                            <img alt='' className='w-56 h-56' src={pokemon.sprites.front_default}></img>
                            <strong className='text-2xl'>{pokemon.name}</strong>
                            <Form id={pokemon.id} />
                        </div>)
                })}
            </div>
            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {!loading && nextUrl && (
                <div className="flex justify-center mt-4">
                    <button onClick={handleFetchMore} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Fetch More
                    </button>
                </div>
            )}
        </div>
    );
};


const Form = ({ id }) => {
    const [comment, setComment] = useState("");
    const handleSubmit = async (event, pokemonid) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const comment = formData.get('comment');

        const data = {
            id: pokemonid,
            comment: comment,
        };
        const response = await axios.post(URI, data);
        console.log(response.status);
    };

    const getComment = async (id) => {
        try {
            const response = await axios(`${URI}/${id}`);
            return response.data;
        }
        catch {
            return "";
        }
    };
    

    useEffect(() => {
        const fetchComment = async () => {
            const commentText = await getComment(id);
            setComment(commentText.comment);
        };
        fetchComment();
    }, [id]);

    return (
        <form onSubmit={(e) => handleSubmit(e, id)}>
            <textarea id="comment" defaultValue={comment} className='bg-slate-200' name="comment" rows="2" cols="20" placeholder="Enter your comment here..."></textarea><br></br>
            <input type="submit" value="Submit"></input>
        </form>
    )
}

export default Pokemons;
