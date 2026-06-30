let offset = 0;
let batchSize = 20;
let pokemonCache = {};
let isLoading = false;

function init() {
    loadPokemonBatch();
}

async function loadPokemonBatch() {
    if (isLoading) return;

    isLoading = true;
    updateLoadButton(true);

    const pokemonList = await fetchPokemonList(batchSize, offset);

    const detailPromises = pokemonList.map(pokemon => {

        // Cache prüfen
        if (pokemonCache[pokemon.name]) {
            return Promise.resolve(pokemonCache[pokemon.name]);
        }

        return fetchPokemonDetails(pokemon.url);
    });

    const results = await Promise.all(detailPromises);

    results.forEach(pokemon => {
        if (!pokemon) return;

        // Im Cache speichern
        pokemonCache[pokemon.name] = pokemon;

        renderPokemonCard(pokemon);
    });

    offset += batchSize;

    isLoading = false;
    updateLoadButton(false);
}

async function fetchPokemonList(limit, offset) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            id:     String(data.id).padStart(3, '0'),
            name:   data.name,
            img:    data.sprites.other.dream_world.front_default
                ||  data.sprites.front_default,
            type:   data.types[0].type.name,
        };
    } catch (error) {
        console.error(`Fehler beim Laden von ${url}:`, error);
        return null;
    }
}

function renderPokemonCard(pokemon) {
    const contentArea = document.getElementById('pokedex-content-area');

    contentArea.innerHTML += getPokemonCards(pokemon);
}

function updateLoadButton(loading) {
    const button = document.getElementById("load-more-btn");

    if (loading) {
        button.disabled = true;
        button.innerText = "Lädt...";
    } else {
        button.disabled = false;
        button.innerText = "Mehr laden";
    }
}