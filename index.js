const url = require('url');
const request = require('requestretry');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const downloadX = require('./downloader.js')
const pokedex = JSON.parse(fs.readFileSync('pokedex.json', 'utf-8'));

const getList = (document) => {
    const generations = ['Generation I', 'Generation II', 'Generation III', 'Generation IV', 'Generation V', 'Generation VI', 'Generation VII', 'Generation VIII'].map(generation => generation.replace(' ', '_'));
    return generations
    .map(generation => {
        const node = document.getElementById(generation).parentElement;
        const table = node.nextElementSibling;
        const rows = Array.from(table.rows);
        return rows.slice(1).map(row => {
            const [hdex, ndex, ms, pokemon, ...types] = row.cells;
            const id = parseInt(ndex.textContent.replace(/(\r\n|\n|\r)/gm,'').trim().replace('#', ''));
            const icon = ms.querySelector('img').getAttribute('src').replace (/^/,'https:');
            const link = pokemon.querySelector('a').getAttribute('href').replace(/^/, 'https://bulbapedia.bulbagarden.net/');
            return {
                id,
                name: pokemon.textContent.replace(/(\r\n|\n|\r)/gm,'').trim(),
                icon,
                link,
                type: types.map(type => type.textContent.replace(/(\r\n|\n|\r)/gm,'').trim())
            };
        });
    })
    .flat();
};

const download = (uri, filename) => {
    return new Promise((resolve, reject) => {
        request.head(uri, (error, response, body) => {    
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve).on('error', reject);
        });

    });
};

const getPage = (uri) => {
    return new Promise((resolve, reject) => {
        request(uri, function (error, response, body) {
            resolve(body);
        });
    });
};

const timer = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
};

const getPokemons = async (pokemons) => {
    let results = [];
    for(let i = 0; i < pokedex.length; i++) {
        const pokemon = pokedex[i];
        const { id, name, type } = pokemon;
        const attributes = pokemons
            .filter(pokemon => pokemon.id === id)
            .filter(pokemon => pokemon.name.toLowerCase() === name.english.toLowerCase())
            .filter(pokemon => pokemon.type.every(t => type.includes(t)));
        
        const attribute = attributes.pop();
        const icon = `icons/${name.english.toLowerCase()}.png`;
        // await download(attribute.icon, icon);
        const page = await getPage(attribute.link);
        const dom = new JSDOM(page);
        console.log('name', name.english);
        const img = dom.window.document.querySelector(`[title="${name.english}"]`).querySelector('img');
        const image = `images/${name.english.toLowerCase()}.png`;
        const src = img.getAttribute('src').replace (/^/,'https:');
        // await download(src, image);
        await downloadX(src, image);
        // console.log(name.english, attribute.link);
        console.log('src:', src);

        results.push({
            ...pokemon,
            link: attribute.link,
            icon
        });
    }
    return results;
    // const results = pokedex.map(async (pokemon) => {

    //     const { id, name, type } = pokemon;
    //     const attributes = pokemons
    //         .filter(pokemon => pokemon.id === id)
    //         .filter(pokemon => pokemon.name.toLowerCase() === name.english.toLowerCase())
    //         .filter(pokemon => pokemon.type.every(t => type.includes(t)));
        
    //     const attribute = attributes.pop();
    //     const icon = `icons/${name.english.toLowerCase()}.png`;
    //     // await download(attribute.icon, icon);
    //     const page = await getPage(attribute.link);
    //     const dom = new JSDOM(page);
    //     const img = dom.window.document.querySelector(`[title="${name.english}"]`).querySelector('img');
    //     const image = `images/${name.english.toLowerCase()}.png`;
    //     const src = img.getAttribute('src').replace (/^/,'https:');
    //     // await download(src, image);
    //     await downloadX(src, image);
    //     // console.log(name.english, attribute.link);
    //     console.log('src:', src);

    //     return {
    //         ...pokemon,
    //         link: attribute.link,
    //         icon
    //     };
    // });

    // return new Promise((resolve, reject) => {
    //     Promise.all(results).then(completed => {
    //         resolve(completed);
    //     });
    // });
};


const makeList = async () => {
    const page = await getPage('https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number');
    const dom = new JSDOM(page);
    return getList(dom.window.document);
};

makeList().then(result => {
    // console.log(result)
    const pk = getPokemons(result).then(p => {
        console.log(p)
    })
    // console.log(result);
    // console.log()
})

// Promise.all(results).then(completed => {
//     console.log(JSON.stringify(completed, null, 2));
// });

