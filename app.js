/*fetch('/.env')
    .then((response) => response.text())
    .then((response) => response.split("=").pop())
    .then((api_key) => {

    })*/

const API_MOVIE_BASE_URL = "https://api.themoviedb.org/3/discover/movie"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/"
const GENDERS_BASE_URL = "https://api.themoviedb.org/3/genre/movie/list"
const MOVIE_Detail_BASE_URL = "https://api.themoviedb.org/3/movie/"
let genders = {} // on mettra ici un objet avec les id en key et les genres en valeur
let API_KEY_URL = "" // on mettra ici le paramètre ?api_key='notre api key'

/**
 * fonction qui récupère la clé api pour authentifier nos requêtes au site
 * @returns {string} apiKey
 */
async function getApiKey(){
    const env = await fetch('/.env')
    const apiKeyText = await env.text()
    const apiKey = apiKeyText.split('=').pop()
    
    return apiKey;
}


/**
 * function qui utilise la fonction global fetch et retourne les données directement parsé
 * @param {string} url
 * @returns les données récupérées
 */
async function getData (url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
}

/**
 * function de trie. trie par date les plus récentes aux moins récentes
 * @param {*} a le premier argument à comparer
 * @param {*} b le deuxième argument à comparer
 * @returns 
 */
function byDateDesc(a,b){
    return  new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
}

/**
 * fonction qui créée une élément html
 * @param {string} element un element html valid ou inventé
 * @returns l'element html créé
 */
function createHtmlElement(element){
    return document.createElement(element)
}

/**
 * fonction créé pour convertir le tableau genres avec les différents genre en 
 * un objet avec en clé les id et en valeur le name du genre
 * @param {*} arr 
 * @returns l'objet créé de type {12: "horreur", 54: "romantique", ...}
 */
function getObjectFrom(arr){
    let genres = {}

    for (const genre of arr) {
        genres[genre.id] = genre.name
    }

    return genres
}

/**
 * fonction qui récupère les genres d'un film
 * @param {array} ids tableau contenant les ids correspondant aux différents genres d'un film
 * @returns {array} un tableau contenant les genres du film
 */
function getGenders(ids){
    let movieGenre = []

    for (const id of ids) {
        // 1, 2, 3
        // {1: "A", 2: "B" ...}
        const name = genders[id]
        movieGenre.push(name)
    }

    return movieGenre
    
}

function convertInHour(timeInMinute){
    
    const h = parseInt(timeInMinute / 60)
    const min = timeInMinute % 60
    let minInText = min
    if( min < 10){
        minInText = `0${min}`
    }
    const time = `${h}h${minInText}`
    return time
}

async function createCard(movie){

    const { id, title , poster_path, release_date, genre_ids } = movie
    const movieDetails = await getData(`${MOVIE_Detail_BASE_URL}${id}${API_KEY_URL}`)
    const durationTime = convertInHour(movieDetails.runtime)

    const cardEl = createHtmlElement("article")
    const titleEl = createHtmlElement("h2")
    const imageEl = createHtmlElement("img")
    const releaseDateEl = createHtmlElement("p")
    const durationEl = createHtmlElement ("p")
    const genderEl = createHtmlElement ("p")
    
    cardEl.appendChild(imageEl)
    cardEl.appendChild(titleEl)    
    cardEl.appendChild(genderEl)
    cardEl.appendChild(releaseDateEl)
    cardEl.appendChild(durationEl)
    

    titleEl.textContent = title
    const IMAGE_BASE_URLMovie = `${IMAGE_BASE_URL}${poster_path}`
    imageEl.setAttribute("src",IMAGE_BASE_URLMovie)
    const altImage = `image du film ${title}`
    imageEl.setAttribute("alt",altImage)
    releaseDateEl.textContent = release_date
    durationEl.textContent = durationTime
   

    const genres = getGenders(genre_ids)
    genderEl.textContent = genres.join(", ")
    console.log(cardEl)
    return cardEl
    
}



// Récupérer les films  
document.addEventListener("DOMContentLoaded", async () => {
    const apiKey = await getApiKey();
    const urlMDB = `${API_MOVIE_BASE_URL}?api_key=${apiKey}`;
    const dataFromMDBMovies = await getData(urlMDB)
    const movies = dataFromMDBMovies.results
    const movieGenres = await getData(`${GENDERS_BASE_URL}?api_key=${apiKey}`)
    const sectionEl = document.querySelector("section")
    console.log(sectionEl)
    if(apiKey && dataFromMDBMovies && movieGenres){
        API_KEY_URL = `?api_key=${apiKey}`
        genders = getObjectFrom(movieGenres.genres)

         console.log(movies);
        //trier les films par date de sortie la + récente en premier
        const movieSortedByDateDesc =  movies.sort(byDateDesc)
        for (const movie of movieSortedByDateDesc) {
           const cardMovie =  await createCard(movie)
           sectionEl.appendChild(cardMovie)
        }
        
    }
    
   

 
} )

// Afficher sur chaque carte le titre, l'affiche, la date de sortie, la durée et le genre
    // Créer les cartes
    // Récupérer les infos d'un film
    // Les afficher
    // Insérer les cartes là où il faut

// chaque carte doit être cliquable
