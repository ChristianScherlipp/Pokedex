function getPokemonCards(pokemon) {
    return `
    <section onclick="" class="pekedex-card">
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
    </section>
    `;
}

function getPokemomType(type) {
    return`
    <div class="poke-type-bg">
        <img class="poke-type-logo-${type}" src="./assets/icons/${type}.svg" alt="Pokemon Type ${type}">
    </div>
    `
}

function getPokemonDialog() {
    return `
    <section class="">
        <header class="dialog-header poke-type-${pokemon.types[0]}">
            
        </header>
        <main class="dialog-main ">
            
        </main>
        <footer class="dialog-footer">
            
        </footer>
    </section>
    `;
}