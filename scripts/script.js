function init() {
    fetchAllPokemon();
}
 
async function fetchAllPokemon() {
    const contentArea = document.getElementById('pokedex-content-area');
    contentArea.innerHTML = ''; // Statische Beispiele entfernen
 
    for (let i = 1; i <= 151; i++) {
        const pokemon = await fetchPokemon(i);
        if (pokemon) {
            contentArea.innerHTML += getPokemonCards(pokemon);
        }
    }
}
 
async function fetchPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
 
        return {
            id:     String(data.id).padStart(3, '0'), // "001", "012", ...
            name:   data.name,
            img:    data.sprites.other.dream_world.front_default
                 || data.sprites.front_default,       // Fallback falls kein Dream-World-Bild
            type:   data.types[0].type.name,          // Primärtyp
        };
    } catch (error) {
        console.error(`Fehler beim Laden von Pokémon #${id}:`, error);
        return null;
    }
}

