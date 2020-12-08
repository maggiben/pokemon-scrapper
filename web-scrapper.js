var generations = ['Generation I', 'Generation II', 'Generation III', 'Generation IV', 'Generation V', 'Generation VI', 'Generation VII', 'Generation VIII'].map(generation => generation.replace(' ', '_'));
var pokemons = generations
.filter(generation => {
    return true;
})
.map(generation => {
    const node = document.getElementById(generation).parentElement;
    const table = node.nextElementSibling;
    const rows = Array.from(table.rows);
    return rows.slice(1).map(row => {
        const [hdex, ndex, ms, pokemon, ...types] = row.cells;
        const id = parseInt(ndex.innerText.replace('#', ''));
        const icon = ms.querySelector('img').getAttribute('src').replace (/^/,'https:');
        const link = pokemon.querySelector('a').getAttribute('href').replace(/^/, 'https://bulbapedia.bulbagarden.net/');
        return {
            id,
            name: pokemon.innerText,
            icon,
            link,
            type: types.map(type => type.innerText)
        };
    });
})
.flat();