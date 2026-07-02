const API_BASE = 'https://pokeapi.co/api/v2';

// Holt eine Liste von Pokemon (Name + URL) fuer einen Batch
async function fetchPokemonList(limit, offset) {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Liste:', error);
        return null;
    }
}

// Holt die Rohdaten eines einzelnen Pokemon ueber dessen URL (fuer die Card)
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von ${url}:`, error);
        return null;
    }
}

// Holt die vollstaendigen Rohdaten eines Pokemon anhand des Namens (fuer den Dialog)
async function fetchPokemonByName(name) {
    try {
        const response = await fetch(`${API_BASE}/pokemon/${name}`);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von Pokemon ${name}:`, error);
        return null;
    }
}

// Holt die Species-Daten (Beschreibung, Kategorie, Link zur Evolution-Chain)
async function fetchPokemonSpecies(id) {
    try {
        const response = await fetch(`${API_BASE}/pokemon-species/${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden der Species-Daten fuer ID ${id}:`, error);
        return null;
    }
}

// Holt die komplette Entwicklungskette ueber die von der Species gelieferte URL
async function fetchEvolutionChain(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Laden der Evolution-Chain:', error);
        return null;
    }
}