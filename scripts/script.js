async function fetchData(){
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
    console.log(response);
    const responseToJson = await response.json();
    console.log(responseToJson);

    document.getElementById('pokemon-img').src = responseToJson.sprites.front_default;
}

fetchData();