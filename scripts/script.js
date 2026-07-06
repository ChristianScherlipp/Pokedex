let offset = 0;
const BATCH_SIZE = 25;
const pokemonCache = {};
const pokemonDetailCache = {};
const speciesCache = {};
const evolutionCache = {};
let isLoading = false;
let totalPokemonCount = null;
let isFirstLoad = true;
const MIN_LOADING_SCREEN_MS = 1000;

function init() {
    loadPokemonBatch();
    document
        .getElementById('main-header-search')
        .addEventListener('input', searchPokemon);
}

async function loadPokemonBatch() {
    const firstLoadStartTime = isFirstLoad ? Date.now() : null;
    const listData = await fetchPokemonList(BATCH_SIZE, offset);
    
    if (isLoading) return;
    beginLoading();
    if (!listData || listData.results.length === 0) {
        finishBatchLoad(firstLoadStartTime, true);
        return;
    }
    await processPokemonBatch(listData);
    finishBatchLoad(firstLoadStartTime, false);
}

function beginLoading() {
    isLoading = true;
    updateLoadButton(true);
}

async function processPokemonBatch(listData) {
    const results = await fetchPokemonCardDataBatch(listData.results);

    if (totalPokemonCount === null) {
        totalPokemonCount = listData.count;
    }
    renderPokemonBatch(results);
    offset += listData.results.length;
    checkAndHideButton();
}

function finishBatchLoad(firstLoadStartTime, hasNoResults) {
    if (hasNoResults) {
        hideLoadButton();
    } else {
        updateLoadButton(false);
    }
    isLoading = false;
    finishFirstLoad(firstLoadStartTime);
}

function finishFirstLoad(firstLoadStartTime) {
    const screen = document.getElementById('app-loading-screen');
    const elapsed = Date.now() - firstLoadStartTime;
    const remaining = Math.max(0, MIN_LOADING_SCREEN_MS - elapsed);

    if (!isFirstLoad) return;
    isFirstLoad = false;
    if (!screen) return;
    setTimeout(() => {
        screen.classList.add('app-loading-screen-hidden');
    }, remaining);
}

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

async function fetchPokemonCardData(url) {
    const data = await fetchPokemonDetails(url);
    const types = data.types.map((t) => t.type.name);

    if (!data) return null;
    if (types.length === 0) return null; // Absicherung falls API keine Typen liefert
    return {
        id: String(data.id).padStart(4, '0'),
        name: data.name,
        img: data.sprites.other.dream_world.front_default || data.sprites.front_default,
        types: types,
    };
}

function renderPokemonBatch(results) {
    let html = '';

    for (let i = 0; i < results.length; i++) {
        if (results[i] === null) continue;
        pokemonCache[results[i].name] = results[i];
        html += getPokemonCards(buildCardView(results[i]));
    }
    document.getElementById('pokedex-content-area').innerHTML += html;
}

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

function buildTypeIconsHtml(types) {
    let html = '';

    for (let i = 0; i < types.length; i++) {
        html += getPokemonType(types[i]);
    }
    return html;
}

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
async function openPokemonDialog(identifier) {
    const dialogArea = document.getElementById('dialog-content-area');
    const pokemon = await loadFullPokemonData(identifier);
    const dialog = renderPokemonDialog(dialogArea, pokemon);

    showLoadingDialog(dialogArea);
    if (!pokemon) {
        closePokemonDialog();
        return;
    }
    attachDialogListeners(dialog);
}

function showLoadingDialog(dialogArea) {
    dialogArea.innerHTML = getPokemonDialogLoading();
    dialogArea.querySelector('dialog').showModal();
    document.body.classList.add('dialog-open');
}

function renderPokemonDialog(dialogArea, pokemon) {
    const dialog = dialogArea.querySelector('dialog');

    dialogArea.innerHTML = getPokemonDialog(buildDialogView(pokemon));
    dialog.showModal();
    switchDialogTab('about');
    history.replaceState(null, '', '#link-1');
    return dialog;
}

function attachDialogListeners(dialog) {
    dialog.addEventListener('close', () => {
        document.body.classList.remove('dialog-open');
    });
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closePokemonDialog();
    });
}

async function navigatePokemonDialog(id) {
    if (!id || id < 1) return;
    if (id > offset) return;
    await openPokemonDialog(id);
}

function closePokemonDialog() {
    const dialog = document.querySelector('#dialog-content-area dialog');
    if (dialog) dialog.close();
    document.body.classList.remove('dialog-open');
}

function switchDialogTab(tab) {
    const dialog = document.querySelector('#dialog-content-area dialog');
    const sections = dialog.querySelectorAll('.dialog-tab-section');
    if (!dialog) return;
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.toggle('active', sections[i].dataset.tab === tab);
    }
}
/* ---------------------- Data acquisition for the dialog ---------------------- */
async function loadFullPokemonData(identifier) {
    const details = await getPokemonDetailData(identifier);
    const species = await getSpeciesData(details.id);
    const evolutionChain = await loadEvolutionChainFor(species);
    if (!details) return null;

    return buildFullPokemonData(details, species, evolutionChain);
}

async function loadEvolutionChainFor(species) {
    if (!species || !species.evolutionChainUrl) return [];
    return await getEvolutionChainData(species.evolutionChainUrl);
}

function buildFullPokemonData(details, species, evolutionChain) {
    return {
        id: String(details.id).padStart(4, '0'),
        name: details.name,
        img: details.img,
        types: details.types,
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

async function getPokemonDetailData(identifier) {
    const data = await fetchPokemonByName(identifier);
    const cached = getCachedDetailByRawData(data);
    const detail = buildPokemonDetail(data);

    if (pokemonDetailCache[identifier]) return pokemonDetailCache[identifier];
    if (!data) return null;
    if (cached) return cached;

    pokemonDetailCache[data.name] = detail;
    pokemonDetailCache[data.id] = detail;
    return detail;
}

function getCachedDetailByRawData(data) {
    return pokemonDetailCache[data.name] || pokemonDetailCache[data.id] || null;
}

function buildPokemonDetail(data) {
    return {
        id: data.id,
        name: data.name,
        img: data.sprites.other.dream_world.front_default || data.sprites.front_default,
        types: data.types.map((t) => t.type.name),
        height: (data.height / 10).toFixed(1),   // Dezimeter -> Meter
        weight: (data.weight / 10).toFixed(1),    // Hektogramm -> Kilogramm
        abilities: data.abilities.map((a) => a.ability.name),
        stats: data.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
        moves: data.moves.slice(0, 16).map((m) => m.move.name),
    };
}

async function getSpeciesData(id) {
    const data = await fetchPokemonSpecies(id);
    const species = buildSpeciesData(data);

    if (speciesCache[id]) return speciesCache[id];
    if (!data) return null;

    speciesCache[id] = species;
    return species;
}

function findPreferredLanguageEntry(entries) {
    return entries.find((e) => e.language.name === 'en') ||
        entries.find((e) => e.language.name === 'de');
}

function buildSpeciesData(data) {
    const flavorEntry = findPreferredLanguageEntry(data.flavor_text_entries);
    const genusEntry = findPreferredLanguageEntry(data.genera);

    return {
        description: flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n\r]/g, ' ') : '',
        genus: genusEntry ? genusEntry.genus : '',
        evolutionChainUrl: data.evolution_chain ? data.evolution_chain.url : null,
    };
}

async function getEvolutionChainData(url) {
    if (evolutionCache[url]) return evolutionCache[url];
    const chain = buildEvolutionChainList(data.chain);
    const data = await fetchEvolutionChain(url);

    if (!data) return [];
    evolutionCache[url] = chain;
    return chain;
}

function buildEvolutionChainList(rootNode) {
    const chain = [];
    let node = rootNode;

    while (node) {
        chain.push(buildEvolutionChainItem(node));
        node = node.evolves_to[0] || null;
    }
    return chain;
}

function buildEvolutionChainItem(node) {
    const id = getIdFromSpeciesUrl(node.species.url);
    return {
        id: id,
        name: node.species.name,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
}

function getIdFromSpeciesUrl(url) {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
}

/* ---------------------- View models for the dialog templates ---------------------- */

function buildDialogView(pokemon) {
    const numericId = parseInt(pokemon.id);
    const navIds = buildNavIds(numericId);
    const tabsHtml = buildDialogTabsHtml(pokemon);
    return {
        name: pokemon.name,
        displayName: capitalize(pokemon.name),
        formattedId: `#${pokemon.id}`,
        img: pokemon.img,
        mainType: pokemon.types[0],
        typeIconsHtml: buildTypeIconsHtml(pokemon.types),
        ...tabsHtml,
        previousId: navIds.previousId,
        nextId: navIds.nextId,
    };
}

function buildDialogTabsHtml(pokemon) {
    return {
        aboutHtml: buildAboutHtml(pokemon),
        statsHtml: buildStatsHtml(pokemon.stats),
        evolutionHtml: buildEvolutionHtml(pokemon.evolutionChain),
        movesHtml: buildMovesHtml(pokemon.moves),
    };
}

function buildNavIds(numericId) {
    const lastVisibleId = offset;
    return {
        previousId: numericId > 1 ? numericId - 1 : lastVisibleId,
        nextId: numericId < lastVisibleId ? numericId + 1 : 1,
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
    let itemsHtml = '';
    if (!chain || chain.length <= 1) {
        return getPokemonNoEvolution();
    }

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

/* ============================= Search ============================= */

function searchPokemon() {
    const searchInput = getSearchInputValue();
    const filteredPokemon = filterPokemonByName(searchInput);
    if (searchInput.length < 3) {
        renderAllLoadedPokemon();
        return;
    }

    document.getElementById('moreCards').classList.add('d-none');
    if (filteredPokemon.length === 0) {
        showNotFound();
        return;
    }
    renderSearchResults(filteredPokemon);
}

function getSearchInputValue() {
    return document
        .getElementById('main-header-search')
        .value
        .toLowerCase()
        .trim();
}

function filterPokemonByName(searchInput) {
    const allPokemon = Object.values(pokemonCache);
    return allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchInput)
    );
}

function showNotFound() {
    document.getElementById('pokedex-content-area').innerHTML = getNotFound();
}

function renderAllLoadedPokemon() {
    const allPokemon = Object.values(pokemonCache);
    renderSearchResults(allPokemon);
    document.getElementById('moreCards').classList.remove('d-none');
}

function renderSearchResults(results) {
    const contentArea = document.getElementById('pokedex-content-area');
    let html = '';

    for (let i = 0; i < results.length; i++) {
        html += getPokemonCards(buildCardView(results[i]));
    }
    document.getElementById('moreCards').classList.add('d-none');
    contentArea.innerHTML = html;
}