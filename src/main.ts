import "./style.css";

import { IFilm } from "./interfaces/IFilm";
import { IPerson } from "./interfaces/IPerson";
import { IPlanet } from "./interfaces/IPlanet";

const BASE_URL = "https://swapi.dev/api/";

const PLANETS_ROUTE = `${BASE_URL}planets/`;
const FILMS_ROUTE = `${BASE_URL}films/`;
const PEOPLE_ROUTE = `${BASE_URL}people/`;

// ^ Searching Param: https://swapi.dev/api/people/?search=r2

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

filmsElement?.addEventListener("click", async () => {
  try {
    const response: Response = await fetch(FILMS_ROUTE);
    const data = await response.json();
    console.log(data.results);

    outputElement.innerHTML = "";
    for (const result of data.results) {
      const filmDiv = document.createElement("div") as HTMLDivElement;
      filmDiv.innerHTML = await displayFilm(result);
      outputElement.appendChild(filmDiv);
    }
  } catch (error) {
    console.error(error);
  }
});

async function displayFilm(film: IFilm): Promise<string> {
  const resultAsString = `
<p class="episode_id">Episode ID: ${film.episode_id}</p>
<p class="film_title">Title: ${film.title}</p>
<p class="opening_crawl">Opening Crawl: ${film.opening_crawl}</p>
<p class="release_date">Release Date: ${film.release_date}</p>
<p class="film_characters">Characters: ${await fetchCharacters(
    film.characters
  )}</p>
  `;
  return resultAsString;
}

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
let planetsArr: IPlanet[] = [];
planetsElement?.addEventListener("click", async () => {
  try {
    await Promise.all([
      fetchPlanetsInPage(1),
      fetchPlanetsInPage(2),
      fetchPlanetsInPage(3),
      fetchPlanetsInPage(4),
      fetchPlanetsInPage(5),
      fetchPlanetsInPage(6),
    ]);
    console.log(planetsArr);

    outputElement.innerHTML = "";
    planetsArr.forEach((planet: IPlanet) => {
      const planetDiv = document.createElement("div") as HTMLDivElement;
      planetDiv.innerHTML = await displayPlanet(planet);
      outputElement.appendChild(planetDiv);
    });
  } catch (error) {
    console.error(error);
  }
});

async function fetchPlanetsInPage(pageNum: number) {
  try {
    const PLANET_BY_PAGE_URL = `${PLANETS_ROUTE}?page=${pageNum}`;
    const response: Response = await fetch(PLANET_BY_PAGE_URL);
    const data = await response.json();

    for (const result of data.results) {
      planetsArr.push(result);
    }
  } catch (error) {
    console.error(error);
  }
}

async function displayPlanet(planet: IPlanet): Promise<string> {
  const resultAsString = `
<p class="planet_name">Name: ${planet.name}</p>
<p class="climate">Climate: ${planet.climate}</p>
<p class="terrain">Terrain: ${planet.terrain}</p>
<p class="population">Population: ${planet.population}</p>
<p class="planet_residents">Residents: ${await fetchCharacters(
    planet.residents
  )}</p>
  `;
  return resultAsString;
}
