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
  showLoader();
  try {
    const response: Response = await fetch(filmURL);
    const data = await response.json();

    const filmsHTML = await Promise.all(
      data.results.map(async (film: IFilm) => {
        const characters = await fetchCharacters(film.characters);
        return `
          <div class="filmDiv">
            <p class="film_title">${film.title}</p>
            <p class="release_date">Release Date: ${film.release_date}</p>
            <p class="film_characters">Characters: ${characters}</p>
          </div>
        `;
      })
    );

    outputElement.innerHTML = filmsHTML.join("");
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}
// ==================================================
async function fetchPlanets(planetURL: string, isForSearch: boolean) {
  planetsArr = [];
  showLoader();
  try {
    await fetchItemsInOnePage(planetURL, isForSearch);

    const planetsHTML = await Promise.all(
      planetsArr.map(async (planet: IPlanet) => {
        const residents = await fetchCharacters(planet.residents);
        return `
          <div class="planetDiv">
            <p class="planet_name">${planet.name}</p>
            <p class="climate">Climate: ${planet.climate}</p>
            <p class="terrain">Terrain: ${planet.terrain}</p>
            <p class="planet_residents">Residents: ${residents}</p>
          </div>
        `;
      })
    );

    outputElement.innerHTML = planetsHTML.join("");
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}

// ==================================================
async function fetchPeople(peopleURL: string, isForSearch: boolean) {
  peopleArr = [];
  showLoader();
  try {
    await fetchItemsInOnePage(peopleURL, isForSearch);

    const peopleHTML = await Promise.all(
      peopleArr.map(async (person: IPerson) => {
        const homeworld = await fetchHomeworld(person.homeworld);
        const films = await fetchPersonFilms(person.films);
        return `
          <div class="personDiv">
            <p class="person_name">${person.name}</p>
            <p class="gender">Gender: ${person.gender}</p>
            <p class="homeworld">Homeworld: ${homeworld}</p>
            <p class="person_films">Films: ${films}</p>
          </div>
        `;
      })
    );

    outputElement.innerHTML = peopleHTML.join("");
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
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
  } catch (error) {
    console.error(error);
  }
}
// ==================================================
async function fetchCharacters(filmCharacters: string[]): Promise<string> {
  try {
    const characterPromises = filmCharacters.map((character) =>
      fetch(character).then((response) => response.json())
    );
    const characters = await Promise.all(characterPromises);
    return characters.map((character) => character.name).join(", ");
  } catch (error) {
    console.error(error);
    return "";
  }
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
  try {
    const titlesOfFilmsPromises = films.map((film) =>
      fetch(film).then((response) => response.json())
    );
    const titlesForfilms = await Promise.all(titlesOfFilmsPromises);
    return titlesForfilms.map((film) => film.title).join(", ");
  } catch (error) {
    console.error(error);
    return "";
  }
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
  showLoader();
  switch (inputSelect.value) {
    case "films":
      SEARCH_URL = `${FILMS_ROUTE}?search=${textValue}`;
      fetchFilms(SEARCH_URL).finally(() => hideLoader());
      break;

    case "planets":
      SEARCH_URL = `${PLANETS_ROUTE}?search=${textValue}`;
      fetchPlanets(SEARCH_URL, true).finally(() => hideLoader());
      break;

    case "people":
      SEARCH_URL = `${PEOPLE_ROUTE}?search=${textValue}`;
      fetchPeople(SEARCH_URL, true).finally(() => hideLoader());
      break;
  }
});

const loaderElement = document.querySelector("#loader") as HTMLDivElement;

function showLoader() {
  loaderElement.classList.remove("hidden");
}

function hideLoader() {
  loaderElement.classList.add("hidden");
}
