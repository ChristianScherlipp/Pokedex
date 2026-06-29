function getPokemonCards(pokemon) {
    return `
    <section class="pekedex-card">
        <header class="card-header">
            <h2 class="pokemon-number">${pokemon.id}</h2>
            <h2 class="pokemon-name">${pokemon.name}</h2>
        </header>
        <main class="card-main poke-type-${pokemon.type}">
            <img class="pokemon-img" src="${pokemon.img}" alt="${pokemon.name}">
        </main>
        <footer class="card-footer">
            <div class="poke-type-bg">
                <img class="poke-type-logo-${pokemon.type}" src="./assets/icons/${pokemon.type}.svg" alt="">
            </div>
        </footer>
    </section>
    `;
}