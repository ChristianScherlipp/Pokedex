let offset = 0;
const BATCH_SIZE = 25;
const pokemonCache = {};        // Rohdaten: id, name, img, types
const pokemonDetailCache = {};  // volle Daten fuer den Dialog: height, weight, abilities, stats, moves
const speciesCache = {};        // Beschreibung, Kategorie, Evolution-Link
const evolutionCache = {};      // aufbereitete Evolution-Ketten
let isLoading = false;
let totalPokemonCount = null;

function init() {
    loadPokemonBatch();
}

async function loadPokemonBatch() {
    if (isLoading) return;

    isLoading = true;
    updateLoadButton(true);

    const listData = await fetchPokemonList(BATCH_SIZE, offset);

    if (!listData || listData.results.length === 0) {
        hideLoadButton();
        isLoading = false;
        return;
    }

    if (totalPokemonCount === null) {
        totalPokemonCount = listData.count;
    }

    const results = await fetchPokemonCardDataBatch(listData.results);
    renderPokemonBatch(results);

    offset += listData.results.length;
    checkAndHideButton();

    isLoading = false;
    updateLoadButton(false);
}

// Holt die Kartendaten fuer eine Liste von Pokemon (parallel, mit Cache)
async function fetchPokemonCardDataBatch(pokemonList) {
    const detailPromises = [];
    for (let i = 0; i < pokemonList.length; i++) {
        if (pokemonCache[pokemonList[i].name]) {
            detailPromises.push(Promise.resolve(pokemonCache[pokemonList[i].name]));
        } else {
            detailPromises.push(fetchPokemonCardData(pokemonList[i].url));
        }
    }
    return await Promise.all(detailPromises);
}

// Baut die schlanken Kartendaten (id, name, img, types) aus den API-Rohdaten
async function fetchPokemonCardData(url) {
    const data = await fetchPokemonDetails(url);
    if (!data) return null;

    const types = data.types.map((t) => t.type.name);
    if (types.length === 0) return null; // Absicherung falls API keine Typen liefert

    return {
        id: String(data.id).padStart(3, '0'),
        name: data.name,
        img: data.sprites.other.dream_world.front_default || data.sprites.front_default,
        types: types,
    };
}

// Baut alle Karten als einen HTML-String und schreibt sie einmal ins DOM
function renderPokemonBatch(results) {
    let html = '';
    for (let i = 0; i < results.length; i++) {
        if (results[i] === null) continue;
        pokemonCache[results[i].name] = results[i];
        html += getPokemonCards(buildCardView(results[i]));
    }
    document.getElementById('pokedex-content-area').innerHTML += html;
}

// Bereitet ein Pokemon fuer die Card-Template auf (Anzeigename, Typ-Icons)
function buildCardView(pokemon) {
    return {
        id: pokemon.id,
        name: pokemon.name,
        displayName: capitalize(pokemon.name),
        img: pokemon.img,
        mainType: pokemon.types[0],
        typeIconsHtml: buildTypeIconsHtml(pokemon.types),
    };
}

// Baut die Icon-Reihe fuer eine Liste von Typen
function buildTypeIconsHtml(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        html += getPokemonType(types[i]);
    }
    return html;
}

// Versteckt den Button wenn alle Pokemon geladen wurden
function checkAndHideButton() {
    if (totalPokemonCount !== null && offset >= totalPokemonCount) {
        hideLoadButton();
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

/* ============================= Dialog ============================= */

// Wird per onclick auf einer Karte aufgerufen: zeigt Ladezustand, holt alle
// Daten fuer den Dialog und rendert ihn dann fertig
async function openPokemonDialog(name) {
    const dialogArea = document.getElementById('dialog-content-area');

    dialogArea.innerHTML = getPokemonDialogLoading();
    dialogArea.querySelector('dialog').showModal();

    const pokemon = await loadFullPokemonData(name);

    if (!pokemon) {
        closePokemonDialog();
        return;
    }

    dialogArea.innerHTML = getPokemonDialog(buildDialogView(pokemon));
    const dialog = dialogArea.querySelector('dialog');
    dialog.showModal();

    // Ersten Tab aktiv setzen: Content anzeigen + Hash auf #link-1, damit
    // die :target-Hervorhebung in der Nav (dialog.css) direkt passt, ohne
    // dass ein Scroll-Sprung oder ein neuer History-Eintrag entsteht
    switchDialogTab('about');
    history.replaceState(null, '', '#link-1');

    // Dialog schliessen bei Klick auf den Backdrop (ausserhalb der Karte)
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closePokemonDialog();
    });
}

function closePokemonDialog() {
    const dialog = document.querySelector('#dialog-content-area dialog');
    if (dialog) dialog.close();
}

// Wechselt zwischen den Tabs "About", "Base stats", "Evolution" und "Moves".
// Die Nav-Hervorhebung selbst (der gleitende Pill-Effekt) uebernimmt die
// :target-CSS in dialog.css, sobald der Klick den Hash aendert - hier wird
// nur der passende Inhalt sichtbar geschaltet.
function switchDialogTab(tab) {
    const dialog = document.querySelector('#dialog-content-area dialog');
    if (!dialog) return;

    const sections = dialog.querySelectorAll('.dialog-tab-section');
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.toggle('active', sections[i].dataset.tab === tab);
    }
}

/* ---------------------- Datenbeschaffung fuer den Dialog ---------------------- */

// Sammelt alle Daten, die der Dialog braucht: Kartendaten, Detaildaten,
// Species-Infos und die Evolution-Kette
async function loadFullPokemonData(name) {
    const base = pokemonCache[name];
    if (!base) return null;

    const details = await getPokemonDetailData(name);
    if (!details) return null;

    const species = await getSpeciesData(details.id);
    console.log(species);
    
    let evolutionChain = [];
    if (species && species.evolutionChainUrl) {
        evolutionChain = await getEvolutionChainData(species.evolutionChainUrl);
    }

    return {
        ...base,
        height: details.height,
        weight: details.weight,
        abilities: details.abilities,
        stats: details.stats,
        moves: details.moves,
        description: species ? species.description : '',
        genus: species ? species.genus : '',
        evolutionChain: evolutionChain,
    };
}

// Holt & normalisiert die vollen Pokemon-Daten (Groesse, Gewicht, Faehigkeiten,
// Stats, Attacken), mit Cache
async function getPokemonDetailData(name) {
    if (pokemonDetailCache[name]) return pokemonDetailCache[name];

    const data = await fetchPokemonByName(name);
    if (!data) return null;

    const detail = {
        id: data.id,
        height: (data.height / 10).toFixed(1),   // Dezimeter -> Meter
        weight: (data.weight / 10).toFixed(1),    // Hektogramm -> Kilogramm
        abilities: data.abilities.map((a) => a.ability.name),
        stats: data.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
        moves: data.moves.slice(0, 16).map((m) => m.move.name),
    };

    pokemonDetailCache[name] = detail;
    return detail;
}

// Holt & normalisiert die Species-Daten (Beschreibung, Kategorie, Evolution-Link),
// mit Cache. Bevorzugt deutsche Texte, faellt auf Englisch zurueck.
async function getSpeciesData(id) {
    if (speciesCache[id]) return speciesCache[id];

    const data = await fetchPokemonSpecies(id);
    if (!data) return null;

    const flavorEntry =
        data.flavor_text_entries.find((e) => e.language.name === 'de') ||
        data.flavor_text_entries.find((e) => e.language.name === 'en');

    const genusEntry =
        data.genera.find((g) => g.language.name === 'de') ||
        data.genera.find((g) => g.language.name === 'en');

    const species = {
        description: flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n\r]/g, ' ') : '',
        genus: genusEntry ? genusEntry.genus : '',
        evolutionChainUrl: data.evolution_chain ? data.evolution_chain.url : null,
    };

    speciesCache[id] = species;
    return species;
}

// Holt & normalisiert die Evolution-Kette als flache Liste (vereinfacht: nur
// der erste Zweig jeder Verzweigung wird beruecksichtigt), mit Cache
async function getEvolutionChainData(url) {
    if (evolutionCache[url]) return evolutionCache[url];

    const data = await fetchEvolutionChain(url);
    if (!data) return [];

    const chain = [];
    let node = data.chain;

    while (node) {
        const id = getIdFromSpeciesUrl(node.species.url);
        chain.push({
            id: id,
            name: node.species.name,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        });
        node = node.evolves_to[0] || null;
    }

    evolutionCache[url] = chain;
    return chain;
}

function getIdFromSpeciesUrl(url) {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
}

/* ---------------------- View-Modelle fuer die Dialog-Templates ---------------------- */

// Baut alle fertigen Werte/Strings, die getPokemonDialog() direkt einsetzen kann
function buildDialogView(pokemon) {    
    return {
        name: pokemon.name,
        displayName: capitalize(pokemon.name),
        formattedId: `#${pokemon.id}`,
        img: pokemon.img,
        mainType: pokemon.types[0],
        typeIconsHtml: buildTypeIconsHtml(pokemon.types),
        aboutHtml: buildAboutHtml(pokemon),
        statsHtml: buildStatsHtml(pokemon.stats),
        evolutionHtml: buildEvolutionHtml(pokemon.evolutionChain),
        movesHtml: buildMovesHtml(pokemon.moves),
    };
}

function buildAboutHtml(pokemon) {
    const genusHtml = pokemon.genus ? `<p class="pokemon-genus">${pokemon.genus}</p>` : '';
    const descriptionHtml = pokemon.description
        ? `<p class="pokemon-description">${pokemon.description}</p>`
        : '';

    return getPokemonAboutTab({
        genusHtml: genusHtml,
        descriptionHtml: descriptionHtml,
        height: pokemon.height,
        weight: pokemon.weight,
        abilitiesText: pokemon.abilities.map(capitalize).join(', '),
    });
}

function buildStatsHtml(stats) {
    let html = '';
    for (let i = 0; i < stats.length; i++) {
        html += getStatBar({
            label: formatStatName(stats[i].name),
            value: stats[i].base,
            percent: calculateStatPercent(stats[i].base),
            barTypeClass: stats[i].base >= 90 ? 'grass' : 'fire',
        });
    }
    return getPokemonStatsTab(html);
}

function calculateStatPercent(base) {
    return Math.min(100, Math.round((base / 180) * 100));
}

function formatStatName(name) {
    const names = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        speed: 'Speed',
    };    
    return names[name] || capitalize(name);
}

function buildEvolutionHtml(chain) {
    if (!chain || chain.length <= 1) {
        return getPokemonNoEvolution();
    }

    let itemsHtml = '';
    for (let i = 0; i < chain.length; i++) {
        itemsHtml += getEvolutionItem({ name: capitalize(chain[i].name), img: chain[i].img });
        if (i < chain.length - 1) {
            itemsHtml += getEvolutionArrow();
        }
    }
    return getPokemonEvolutionTab(itemsHtml);
}

function buildMovesHtml(moves) {
    let chipsHtml = '';
    if (!moves || moves.length === 0) {
        return getPokemonNoMoves();
    }
    for (let i = 0; i < moves.length; i++) {       
        chipsHtml += getMoveChip(formatMoveName(moves[i]));
    }
    return getPokemonMovesTab(chipsHtml);
}

function formatMoveName(move) {    
    return capitalize(move.replace(/-/g, ' '));
}

function capitalize(str) {    
    return str.charAt(0).toUpperCase() + str.slice(1);
}