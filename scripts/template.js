function getPokemonCards(pokemon) {
    return `
    <button onclick="" class="pekedex-card">
        <header class="card-header">
            <h2 class="pokemon-number">${pokemon.id}</h2>
            <h2 class="pokemon-name">${pokemon.name}</h2>
        </header>
        <main class="card-main poke-type-${pokemon.types[0]}">
            <img class="pokemon-img" src="${pokemon.img}" alt="${pokemon.name}">
        </main>
        <footer class="card-footer">
            <section class="card-footer-type">
                ${getPokemonTypeIcons(pokemon)}
            </section>
        </footer>
    </button>
    `;
}

function getPokemonType(type) {
    return`
    <div class="poke-type-bg">
        <img class="poke-type-logo-${type}" src="./assets/icons/${type}.svg" alt="Pokemon Type ${type}">
    </div>
    `
}

function getPokemonDialog(pokemon, types) {
    return `
            <dialog class="dialog-card poke-type-${pokemon} poke-type-${types}-shadow">
                <header class="dialog-header poke-type-${pokemon.types[0]}">
                    <section class="dialog-header-name-number">
                        <h2>Name</h2>
                        <p>nummer</p>
                    </section>
                    <section class="dialog-header-logo-pokemon">
                        <section class="poke-type-area">
                            <div class="poke-type-bg">
                                <img class="poke-type-logo-${type}" src="./assets/icons/${type}.svg" alt="Pokemon Type ${type}">
                            </div>
                            <div class="poke-type-bg">
                                <img class="poke-type-logo-${type}" src="./assets/icons/${type}.svg" alt="Pokemon Type ${type}">
                            </div>
                        </section>
                        <img class="pokemon-img" src="${pokemon.img}" alt="${pokemon.name}">
                    </section>
                </header>
                <main class="dialog-main ">
                    <section class="wrapper">
                        <nav class="dialog-main-nav">
                            <a href="#link1" id="link-1">About</a>
                            <a href="#link2" id="link-2">Base stats</a>
                            <a href="#link3" id="link-3">Evolution</a>
                            <a href="#link4" id="link-4">Moves</a>
                        </nav>
                    </section>
                </main>
                <footer class="dialog-footer">
                    
                </footer>
            </dialog>
    `;
}