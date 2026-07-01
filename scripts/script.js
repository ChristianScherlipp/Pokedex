let offset = 0;
const BATCH_SIZE = 20;
const pokemonCache = {};
let isLoading = false;
let totalPokemonCount = null;

function init() {
    loadPokemonBatch();
}

async function loadPokemonBatch() {
    if (isLoading) return;

    isLoading = true;
    updateLoadButton(true);

    const pokemonList = await fetchPokemonList(BATCH_SIZE, offset);

    if (pokemonList.length === 0) {
        hideLoadButton();
        isLoading = false;
        return;
    }

    const results = await fetchPokemonDetailsBatch(pokemonList);
    renderPokemonBatch(results);

    offset += pokemonList.length;
    checkAndHideButton();

    isLoading = false;
    updateLoadButton(false);
}

// Holt die Details fuer eine Liste von Pokemon (parallel, mit Cache)
async function fetchPokemonDetailsBatch(pokemonList) {
    const detailPromises = [];
    for (let i = 0; i < pokemonList.length; i++) {
        if (pokemonCache[pokemonList[i].name]) {
            detailPromises.push(Promise.resolve(pokemonCache[pokemonList[i].name]));
        } else {
            detailPromises.push(fetchPokemonDetails(pokemonList[i].url));
        }
    }
    return await Promise.all(detailPromises);
}

// Baut alle Karten als einen HTML-String und schreibt sie einmal ins DOM
function renderPokemonBatch(results) {
    let html = '';
    for (let i = 0; i < results.length; i++) {
        if (results[i] === null) continue;
        pokemonCache[results[i].name] = results[i];
        html += getPokemonCards(results[i]);
    }
    document.getElementById('pokedex-content-area').innerHTML += html;
}

// Versteckt den Button wenn alle Pokemon geladen wurden
function checkAndHideButton() {
    if (totalPokemonCount !== null && offset >= totalPokemonCount) {
        hideLoadButton();
    }
}

async function fetchPokemonList(limit, offset) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();

        if (totalPokemonCount === null) {
            totalPokemonCount = data.count;
        }

        return data.results;
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Liste:', error);
        return [];
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const types = [];
        for (let i = 0; i < data.types.length; i++) {
            types.push(data.types[i].type.name);
        }

        if (types.length === 0) return null; // Absicherung falls API keine Typen liefert

        return {
            id:    String(data.id).padStart(3, '0'),
            name:  data.name,
            img:   data.sprites.other.dream_world.front_default
                || data.sprites.front_default,
            types: types,
        };
    } catch (error) {
        console.error(`Fehler beim Laden von ${url}:`, error);
        return null;
    }
}

function updateLoadButton(loading) {
    const button = document.getElementById('load-more-btn');
    button.disabled = loading;
    button.innerText = loading ? 'Lädt...' : 'Mehr laden';
}

function hideLoadButton() {
    document.getElementById('load-more-btn').classList.add('hidden');
}

// Gibt fuer jeden Typ des Pokemon ein Icon-Element zurueck
function getPokemonTypeIcons(pokemon) {
    let icons = '';
    for (let i = 0; i < pokemon.types.length; i++) {
        icons += getPokemonType(pokemon.types[i]);
    }
    return icons;
}