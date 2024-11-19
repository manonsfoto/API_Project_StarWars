import "./style.css";

import { IFilm } from "./interfaces/IFilm";
import { IPerson } from "./interfaces/IPerson";
import { IPlanet } from "./interfaces/IPlanet";

const BASE_URL = "https://swapi.dev/api/";

const PLANETS_ROUTE = `${BASE_URL}planets/`;
const FILMS_ROUTE = `${BASE_URL}films/`;
const PEOPLE_ROUTE = `${BASE_URL}people/`;

// ^=== DOM Elemente ======================

const filmsElement = document.querySelector("#api-films") as HTMLButtonElement;
const planetsElement = document.querySelector(
  "#api-planets"
) as HTMLButtonElement;
const peopleElement = document.querySelector(
  "#api-people"
) as HTMLButtonElement;
const outputElement = document.querySelector("#output") as HTMLDivElement;
const inputSelect = document.querySelector("#inputSelect") as HTMLInputElement;
const inputText = document.querySelector("#inputText") as HTMLInputElement;
const btnSearch = document.querySelector("#btnSearch") as HTMLButtonElement;

// ^=== Empty Arrays for total items ======================

let planetsArr: IPlanet[] = [];
let peopleArr: IPerson[] = [];

// ^=== fetch functions ======================

async function fetchFilms(filmURL: string) {
  try {
    const response: Response = await fetch(filmURL);
    const data = await response.json();

    outputElement.innerHTML = "";

    for (const result of data.results) {
      const filmDiv = document.createElement("div") as HTMLDivElement;
      filmDiv.classList.add("filmDiv");
      filmDiv.innerHTML = await displayFilm(result);
      outputElement.appendChild(filmDiv);
    }
  } catch (error) {
    console.error(error);
  }
}
// ==================================================
async function fetchPlanets(planetURL: string, isForSearch: boolean) {
  try {
    await fetchItemsInOnePage(planetURL, isForSearch);

    outputElement.innerHTML = "";

    planetsArr.forEach((planet: IPlanet) => {
      const planetDiv = document.createElement("div") as HTMLDivElement;
      planetDiv.classList.add("planetDiv");
      const resultAsString = displayPlanet(planet);
      resultAsString.then((result) => (planetDiv.innerHTML = result));
      outputElement.appendChild(planetDiv);
    });
  } catch (error) {
    console.error(error);
  }
}
// ==================================================
async function fetchPeople(peopleURL: string, isForSearch: boolean) {
  try {
    await fetchItemsInOnePage(peopleURL, isForSearch);

    outputElement.innerHTML = "";

    peopleArr.forEach((person: IPerson) => {
      const personDiv = document.createElement("div") as HTMLDivElement;
      personDiv.classList.add("personDiv");

      const resultAsString = displayPerson(person);
      resultAsString.then((result) => (personDiv.innerHTML = result));
      outputElement.appendChild(personDiv);
    });
  } catch (error) {
    console.error(error);
  }
}
// ==================================================

async function generatePageCounter(routeURL: string): Promise<number> {
  let pageCounter: number = 1;
  try {
    const response: Response = await fetch(routeURL);
    const data = await response.json();
    pageCounter = Math.ceil(data.count / 10);
  } catch (error) {
    console.error(error);
  }
  return pageCounter;
}

// ====================================================
async function fetchItemsInOnePage(routeURL: string, isForSearch: boolean) {
  try {
    const pageCounter = await generatePageCounter(routeURL);
    console.log("pageCounter:", pageCounter);

    let index: number = 0;

    while (index < pageCounter) {
      index++;
      const PAGE_URL = `${routeURL}?page=${index}`;
      const SEARCH_PAGE_URL = `${routeURL}&page=${index}`;
      const response: Response = await fetch(
        isForSearch ? SEARCH_PAGE_URL : PAGE_URL
      );
      const data = await response.json();

      for (const result of data.results) {
        routeURL.includes("planet")
          ? planetsArr.push(result)
          : peopleArr.push(result);
      }
    }
    console.log("plnetsARR:", planetsArr);
    console.log("peopleARR:", peopleArr);
  } catch (error) {
    console.error(error);
  }
}
// ==================================================
async function fetchCharacters(filmCharacters: string[]): Promise<string> {
  const resultArray: string[] = [];
  for (const character of filmCharacters) {
    try {
      const response = await fetch(character);
      const data: IPerson = await response.json();
      resultArray.push(data.name);
    } catch (error) {
      console.error(error);
    }
  }

  return resultArray.join(", ");
}

// ==================================================
async function fetchHomeworld(planet: string): Promise<string> {
  let homeworld: string = "";
  try {
    const response = await fetch(planet);
    const data: IPlanet = await response.json();
    homeworld = data.name;
  } catch (error) {
    console.error(error);
  }
  return homeworld;
}

// ==================================================

async function fetchPersonFilms(films: string[]): Promise<string> {
  const resultArray: string[] = [];
  for (const film of films) {
    try {
      const response = await fetch(film);
      const data: IFilm = await response.json();
      resultArray.push(data.title);
    } catch (error) {
      console.error(error);
    }
  }

  return resultArray.join(", ");
}

// ^=== display functions ======================

async function displayFilm(film: IFilm): Promise<string> {
  const resultAsString = `
<p class="film_title">${film.title}</p>
<p class="release_date">Release Date: ${film.release_date}</p>
<p class="film_characters">Characters: ${await fetchCharacters(
    film.characters
  )}</p>
  `;
  return resultAsString;
}
// ==================================================
async function displayPlanet(planet: IPlanet): Promise<string> {
  const resultAsString = `
<p class="planet_name">${planet.name}</p>
<p class="climate">Climate: ${planet.climate}</p>
<p class="terrain">Terrain: ${planet.terrain}</p>
<p class="planet_residents">Residents: ${await fetchCharacters(
    planet.residents
  )}</p>
  `;
  return resultAsString;
}
// ==================================================
async function displayPerson(person: IPerson): Promise<string> {
  const resultAsString = `
<p class="person_name">${person.name}</p>
<p class="gender">Gender: ${person.gender}</p>
<p class="homeworld">Homeworld: ${await fetchHomeworld(person.homeworld)}</p>
<p class="person_films">Films:${await fetchPersonFilms(person.films)}</p>

  `;
  return resultAsString;
}

// ^=== buttons events ======================
filmsElement?.addEventListener("click", () => {
  fetchFilms(FILMS_ROUTE);
});
// ==================================================
planetsElement?.addEventListener("click", () => {
  fetchPlanets(PLANETS_ROUTE, false);
});
// ==================================================
peopleElement?.addEventListener("click", () => {
  fetchPeople(PEOPLE_ROUTE, false);
});

// ==================================================
btnSearch?.addEventListener("click", () => {
  const textValue = inputText?.value.trim().toLowerCase();
  let SEARCH_URL = "";
  switch (inputSelect.value) {
    case "films":
      SEARCH_URL = `${FILMS_ROUTE}?search=${textValue}`;
      return fetchFilms(SEARCH_URL);

    case "planets":
      SEARCH_URL = `${PLANETS_ROUTE}?search=${textValue}`;

      return fetchPlanets(SEARCH_URL, true);

      break;
    case "people":
      SEARCH_URL = `${PEOPLE_ROUTE}?search=${textValue}`;
      return fetchPeople(SEARCH_URL, true);
  }
});
