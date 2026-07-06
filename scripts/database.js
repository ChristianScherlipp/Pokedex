const API_BASE = 'https://pokeapi.co/api/v2';

async function fetchPokemonList(limit, offset) {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Liste:', error);
        return null;
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von ${url}:`, error);
        return null;
    }
}

async function fetchPokemonByName(name) {
    try {
        const response = await fetch(`${API_BASE}/pokemon/${name}`);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von Pokemon ${name}:`, error);
        return null;
    }
}

async function fetchPokemonSpecies(id) {
    try {
        const response = await fetch(`${API_BASE}/pokemon-species/${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden der Species-Daten fuer ID ${id}:`, error);
        return null;
    }
}

async function fetchEvolutionChain(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Laden der Evolution-Chain:', error);
        return null;
    }
}