#! /usr/bin/env node
import fetch from 'node-fetch';


async function fetchSwapi(url) {
    var objectToReturn = null;
    await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            return response.json();
        })
        .then(responseObject => {
            objectToReturn = responseObject
        })
        .catch(error => console.log(error)); // comment to hide errors from the user

    return objectToReturn
}

async function retrieveAllPlanets(url) {
    var allPlanets = [];
    do {
        await fetchSwapi(url)
            .then(planets => {
                url = planets.next
                allPlanets = allPlanets.concat(planets.results)
            })
            .catch(error => {
                url = null
                console.log(error) // comment to hide errors from the user
            })
    }
    while (url)

    return allPlanets
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function checkConditions(planet) {
    var condTerrain = false;
    var condWater = false;
    if (typeof planet.terrain !== "undefined" && planet.terrain && planet.terrain.length > 0 && planet.terrain.includes('mountains')) {
        condTerrain = true;
    }
    if (isNumeric(planet.surface_water) && Number(planet.surface_water) > 0) {
        condWater = true;
    }
    return condTerrain && condWater
}

function main() {
    const filmId = process.argv.length > 2 ? process.argv[2] : "1";
    var correspondingPlanets = []; // planets from movie requested and meeting conditions
    const api = "https://swapi.dev/api/";


    if (isNumeric(filmId)) {
        if (Number(filmId) > 6 || Number(filmId) < 1) {
            console.log("Come on! We are talking about REAL Star Wars movies!")
        }
        else {
            console.log("Exploring the Galaxy to find all planets...")
            retrieveAllPlanets(api + "planets/")
                .then(allPlanets => {
                    if (allPlanets.length > 0) {
                        console.log("Okay, I know all the planets now!")
                        fetchSwapi(api + "films/" + filmId + "/")
                            .then(film => {
                                var planetIndTmp = 0;
                                film.planets.forEach(elem => {
                                    planetIndTmp = elem.replace(api + "planets/", '').replace('/', '');
                                    if (checkConditions(allPlanets[planetIndTmp - 1])) {
                                        correspondingPlanets.push(allPlanets[planetIndTmp - 1])
                                    }
                                });
                                if (correspondingPlanets.length > 1) {
                                    console.log(`In Film #${filmId} there are ${correspondingPlanets.length} planets that have mountains and a water surface (> 0).`)
                                }
                                else {
                                    console.log(`In Film #${filmId} there is ${correspondingPlanets.length} planet that has mountains and a water surface (> 0).`)
                                }

                                var sum = 0;
                                correspondingPlanets.forEach(result => {
                                    sum += Number(result.diameter);
                                    console.log(`- ${result.name}, diameter: ${result.diameter}`)
                                })
                                console.log(`Total diameter: ${sum}`)

                            })
                            .catch((error) => {
                                console.log("A problem occured, try again.")
                                console.log(error) // comment to hide errors from the user
                            })
                    }
                    else {
                        console.log("My hyperdrive is broken. I can't go any further.");
                    }

                })
                .catch((error) => {
                    console.log("My hyperdrive is broken. I can't go any further.")
                    console.log(error) // comment to hide errors from the user
                })
        }
    }
    else {
        console.log("This is not a film!")
    }
}

main();