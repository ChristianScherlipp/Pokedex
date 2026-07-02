/* ============================================================
   Alle Funktionen hier nehmen fertig aufbereitete Werte entgegen
   und geben nur HTML-Strings zurueck. Keine Berechnungen, keine
   Schleifen, keine Bedingungen - das passiert alles in script.js.
   ============================================================ */

function getPokemonCards(pokemon) {    
    return `
    <button onclick="openPokemonDialog('${pokemon.name}')" class="pekedex-card">
        <header class="card-header">
            <h2 class="pokemon-number">${pokemon.id}</h2>
            <h2 class="pokemon-name">${pokemon.displayName}</h2>
        </header>
        <main class="card-main poke-type-${pokemon.mainType}">
            <img class="pokemon-img" src="${pokemon.img}" alt="${pokemon.name}">
        </main>
        <footer class="card-footer">
            <section class="card-footer-type">
                ${pokemon.typeIconsHtml}
            </section>
        </footer>
    </button>
    `;
}

function getPokemonType(type) {
    return `
    <div class="poke-type-bg">
        <img class="poke-type-logo-${type}" src="./assets/icons/${type}.svg" alt="Pokemon Type ${type}">
    </div>
    `;
}

/* ============================= Dialog ============================= */

function getPokemonDialogLoading() {
    return `
    <dialog class="dialog-card">
        <div class="dialog-loading">Lädt Pokémon-Daten...</div>
    </dialog>
    `;
}

function getPokemonDialog(view) {    
    return `
    <dialog class="dialog-card poke-type-${view.mainType}-shadow">
        <button class="dialog-close-btn" onclick="closePokemonDialog()" aria-label="Schließen">✕</button>
        <header class="dialog-header poke-type-${view.mainType}">
            <section class="dialog-header-name-number">
                <h2>${view.displayName}</h2>
                <p>${view.formattedId}</p>
            </section>
            <section class="dialog-header-logo-pokemon">
                <section class="poke-type-area">
                    ${view.typeIconsHtml}
                </section>
                <img class="pokemon-img" src="${view.img}" alt="${view.name}">
            </section>
        </header>
        <main class="dialog-main">
            <section class="wrapper">
                <nav class="dialog-main-nav">
                    <a href="#link-1" id="link-1" data-tab="about" onclick="switchDialogTab('about')">About</a>
                    <a href="#link-2" id="link-2" data-tab="stats" onclick="switchDialogTab('stats')">Base stats</a>
                    <a href="#link-3" id="link-3" data-tab="evolution" onclick="switchDialogTab('evolution')">Evolution</a>
                    <a href="#link-4" id="link-4" data-tab="moves" onclick="switchDialogTab('moves')">Moves</a>
                </nav>
            </section>
            <section class="dialog-tab-section active" data-tab="about">
                    ${view.aboutHtml}
                </section>
                <section class="dialog-tab-section" data-tab="stats">
                    ${view.statsHtml}
                </section>
                <section class="dialog-tab-section" data-tab="evolution">
                    ${view.evolutionHtml}
                </section>
                <section class="dialog-tab-section" data-tab="moves">
                    ${view.movesHtml}
                </section>
        </main>
        <footer class="dialog-footer">
            
        </footer>
    </dialog>
    `;
}

// --- Tab: About ---
function getPokemonAboutTab(view) {    
    return `
    <div class="about-content">
        ${view.genusHtml}
        ${view.descriptionHtml}
        <div class="about-grid">
            <div class="about-row">
                <span class="about-label">Größe</span>
                <span class="about-value">${view.height} m</span>
            </div>
            <div class="about-row">
                <span class="about-label">Gewicht</span>
                <span class="about-value">${view.weight} kg</span>
            </div>
            <div class="about-row">
                <span class="about-label">Fähigkeiten</span>
                <span class="about-value">${view.abilitiesText}</span>
            </div>
        </div>
    </div>
    `;
}

// --- Tab: Base stats ---
function getPokemonStatsTab(statsHtml) {
    return `<div class="stats-content">${statsHtml}</div>`;
}

function getStatBar(view) {
    return `
    <div class="stat-row">
        <span class="stat-name">${view.label}</span>
        <span class="stat-value">${view.value}</span>
        <div class="stat-bar-bg">
            <div class="stat-bar-fill poke-type-${view.barTypeClass}" style="width:${view.percent}%"></div>
        </div>
    </div>
    `;
}

// --- Tab: Evolution ---
function getPokemonEvolutionTab(itemsHtml) {
    return `<div class="evolution-content">${itemsHtml}</div>`;
}

function getPokemonNoEvolution() {
    return '<p class="no-evolution">Dieses Pokémon entwickelt sich nicht weiter.</p>';
}

function getEvolutionItem(view) {
    return `
    <div class="evolution-item">
        <img class="evolution-img" src="${view.img}" alt="${view.name}">
        <p class="evolution-name">${view.name}</p>
    </div>
    `;
}

function getEvolutionArrow() {
    return '<span class="evolution-arrow">→</span>';
}

// --- Tab: Moves ---
function getPokemonMovesTab(chipsHtml) {
    return `<div class="moves-content">${chipsHtml}</div>`;
}

function getPokemonNoMoves() {
    return '<p class="no-moves">Keine Attacken gefunden.</p>';
}

function getMoveChip(text) {
    return `<span class="move-chip">${text}</span>`;
}