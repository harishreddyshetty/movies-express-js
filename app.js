const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let db = null;
module.exports = app;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has started");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieToCamelCase = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

//api 1

app.get("/movies/", async (request, response) => {
  const query = `SELECT movie_name as movieName FROM movie;`;
  const dbResponse = await db.all(query);
  response.send(dbResponse);
});

// api 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const query = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(
      ${directorId},
      "${movieName}",
      "${leadActor}");`;
  const dbResponse = await db.run(query);
  response.send("Movie Successfully Added");
});

// api 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `SELECT * FROM movie 
  WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(query);
  response.send(convertMovieToCamelCase(dbResponse));
});

// api 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const query = `UPDATE movie 
     SET director_id = ${directorId},
     movie_name = "${movieName}",
     lead_actor ="${leadActor}"
     
     WHERE movie_id = ${movieId};`;
  try {
    const dbResponse = await db.run(query);
    response.send("Movie Details Updated");
  } catch (error) {
    console.log(error.message);
  }
});

// api 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `DELETE FROM movie 
     WHERE movie_id = ${movieId};`;
  try {
    const dbResponse = await db.run(query);
    response.send("Movie Removed");
  } catch (error) {
    console.log(error.message);
  }
});

// api 6

app.get("/directors/", async (request, response) => {
  const query = `SELECT director_id as directorId,director_name as directorName
   FROM director;`;
  const dbResponse = await db.all(query);
  response.send(dbResponse);
});

// api 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `SELECT movie_name as movieName 
  FROM movie WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(query);
  response.send(dbResponse);
});
