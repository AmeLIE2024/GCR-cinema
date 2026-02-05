console.log(window.location.search);
const idMovie = window.location.search.split("=").pop();
const UrlAPI = "https://api.themoviedb.org/3/movie/";
const GENDERS_BASE_URL = "https://api.themoviedb.org/3/genre/movie/list"
const UrlMovie = UrlAPI + idMovie;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";
let genders = {} // on mettra ici un objet avec les id en key et les genres en valeur
let API_KEY_PARAM = ""; // on mettra ici le paramètre ?api_key='notre api key'

async function getData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function createHtmlElement(element) {
  return document.createElement(element);
}

async function getApiKey() {
  const env = await fetch("/.env");
  const apiKeyText = await env.text();
  const apiKey = apiKeyText.split("=").pop();

  return apiKey;
}

function getObjectFrom(arr){
    let genres = {}

    for (const genre of arr) {
        genres[genre.id] = genre.name
    }

    return genres
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

async function createCard(movie) {
  const { id, title, poster_path, release_date, genre_ids } = movie;
  const movieDetails = await getData(
    `${UrlAPI}${id}${API_KEY_PARAM}`,
  );
  const durationTime = convertInHour(movieDetails.runtime);

  const cardEl = createHtmlElement("article");
  const linkEl = createHtmlElement("a");
  const titleEl = createHtmlElement("h2");
  const imageEl = createHtmlElement("img");
  const releaseDateEl = createHtmlElement("p");
  const durationEl = createHtmlElement("p");
  const genderEl = createHtmlElement("p");

  cardEl.appendChild(linkEl);
  linkEl.appendChild(imageEl);
  linkEl.appendChild(titleEl);
  linkEl.appendChild(genderEl);
  linkEl.appendChild(releaseDateEl);
  linkEl.appendChild(durationEl);

  linkEl.setAttribute("href", `/movie.html?id=${id}`);
  titleEl.textContent = title;
  const IMAGE_BASE_URLMovie = `${IMAGE_BASE_URL}${poster_path}`;
  imageEl.setAttribute("src", IMAGE_BASE_URLMovie);
  const altImage = `image du film ${title}`;
  imageEl.setAttribute("alt", altImage);
  releaseDateEl.textContent = release_date;
  durationEl.textContent = durationTime;

  const genres = getGenders(genre_ids);
  genderEl.textContent = genres.join(", ");
  console.log(cardEl);
  return cardEl;
}

async function createMovie(movie) {
  const titleEl = document.querySelector("h1");
  titleEl.textContent = movie.title;

  const imgMovieEl = document.querySelector("img");
  imgMovieEl.setAttribute(
    "src",
    `${IMAGE_BASE_URL}/${movie.poster_path}${API_KEY_PARAM}`,
  );
  
  imgMovieEl.setAttribute("alt", "affiche du film");

  const paragrapEls = document.querySelectorAll("p");
  const [synopsisEl, charactEl] = paragrapEls;

  synopsisEl.textContent = movie.overview;
  const characterssUrl = `${UrlAPI}${movie.id}/credits${API_KEY_PARAM}`;
  const charactMovie = await getData(characterssUrl);
  const characteres = charactMovie.cast;
  let personsList = [];
  characteres.map((charactere) => {
    const person = charactere.name;
    personsList.push(person);
  });

  charactEl.textContent = personsList.join(", ");

  const recommendationsUrl = `${UrlAPI}${movie.id}/recommendations${API_KEY_PARAM}`;
  const movieRecommendations = await getData(recommendationsUrl);
  console.log(movieRecommendations);
  const recommendations = movieRecommendations.results;

  const recommendationsEl = document.querySelector(
    ".film-recommendations > div",
  );
 
  if (recommendations.length == 0) {
    const pEl = createHtmlElement("p");
    recommendationsEl.appendChild(pEl);
    pEl.textContent = "Pas de recommandation pour le moment";
  } else {
    recommendations.map(async (recommendation) => {
      const recommendationCardEl = await createCard(recommendation);
      recommendationsEl.appendChild(recommendationCardEl);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const apiKey = await getApiKey();
  const movie = await getData(`${UrlMovie}?api_key=${apiKey}`);
  const movieGenres = await getData(`${GENDERS_BASE_URL}?api_key=${apiKey}`)
  if (apiKey && movie && movieGenres) {
    API_KEY_PARAM = `?api_key=${apiKey}`;
    genders = getObjectFrom(movieGenres.genres)
    console.log(movie);
    await createMovie(movie);
  }
});
