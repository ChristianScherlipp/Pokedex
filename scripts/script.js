let pokemonLimit = 25; // Anzahl der Pokemon, die geladen werden sollen

function init() {
    fetchAllPokemon();
}

async function fetchAllPokemon() {
    const contentArea = document.getElementById('pokedex-content-area');
    contentArea.innerHTML = ''; // Statische Beispielkarte entfernen

    // Schritt 1: Liste der ersten POKEMON_LIMIT Pokemon-Namen + URLs holen
    const pokemonList = await fetchPokemonList(pokemonLimit);
    console.log(pokemonList);
    
    // Schritt 2: Alle Detail-Requests gleichzeitig (parallel) starten
    const detailPromises = [];
    for (let i = 0; i < pokemonList.length; i++) {
        detailPromises.push(fetchPokemonDetails(pokemonList[i].url));
    }
    const pokemonResults = await Promise.all(detailPromises);

    // Schritt 3: Karten in der richtigen Reihenfolge (nach ID) rendern
    pokemonResults
        .filter(pokemon => pokemon !== null) // fehlgeschlagene Requests ausfiltern
        .sort((a, b) => Number(a.id) - Number(b.id))
        .forEach(pokemon => {
            contentArea.innerHTML += getPokemonCards(pokemon);
        });
}

async function fetchPokemonList(limit) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`);
        const data = await response.json();
        return data.results; // Array aus { name, url }
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Liste:', error);
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
                 || data.sprites.front_default,
            type:   data.types[0].type.name,
        };
    } catch (error) {
        console.error(`Fehler beim Laden von ${url}:`, error);
        return null;
    }
}