import express from "express";
import session from "express-session";
import axios from "axios";
import bodyParser from "body-parser";
import queryString from "node:querystring";

const app = express();
const port = 3000;
const numberOfSongs = 50; // can't get more than 50 songs

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "accessToken",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 60 * 60 * 1000,
    },
  })
);

app.get("/", (req, res) => {
  if (req.session.accessToken) {
    res.render("success.ejs");
  } else {
    res.render("index.ejs");
  }
});

app.post("/get-auth", (req, res) => {
  try {
    req.session.clientId = req.body.clientId;
    req.session.clientSecret = req.body.clientSecret;
    let url =
      "https://accounts.spotify.com/authorize/" +
      "?client_id=" +
      req.body.clientId +
      "&response_type=code&redirect_uri=" +
      encodeURI("http://localhost:3000/auth/") +
      "&show_dialog=true&scope=user-top-read";
    res.redirect(url);
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs");
  }
});

app.get("/auth", async (req, res) => {
  try {
    const credentials = `${req.session.clientId}:${req.session.clientSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");
    const spotifyResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      queryString.stringify({
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: encodeURI("http://localhost:3000/auth/"),
      }),
      {
        headers: {
          Authorization: "Basic " + encodedCredentials,
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    req.session.accessToken = spotifyResponse.data.access_token;
    res.redirect("/success");
  } catch (error) {
    res.render("index.ejs", {
      error: error.response.data.error_description,
    });
  }
});

app.get("/start-quiz", async (req, res) => {
  try {
    const result = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=" + numberOfSongs,
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );
    let correctAnswersArray = randomNumbers(10, result.data);
    let answersArray = answers(correctAnswersArray);
    res.render("success.ejs", {
      content: result.data,
      correctAnswersArray: correctAnswersArray,
      allAnswersArray: answersArray,
    });
  } catch (error) {
    console.error("Error: " + error);
    res.render("success.ejs", { content: error });
  }
});

app.get("/success", (req, res) => {
  res.render("success.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

function randomNumbers(size, data) {
  let tab = [];
  for (let i = 0; i < size; i++) {
    tab[i] = Math.floor(Math.random() * numberOfSongs);
    if (data.items[tab[i]].preview_url != null) {
      for (let j = 0; j < i; j++) {
        if (tab[j] == tab[i]) {
          i--;
          break;
        }
      }
    } else {
      i--;
    }
  }
  return tab;
}

function answers(randomNumbers) {
  let temp = [];
  let answersArray = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 1; j++) {
      temp[j] = randomNumbers[i];
    }
    for (let j = 1; j < 4; j++) {
      temp[j] = Math.floor(Math.random() * numberOfSongs);
      for (let k = 0; k < j; k++) {
        if (temp[k] == temp[j]) {
          j--;
          break;
        }
      }
    }
    shuffle(temp);
    answersArray[i] = temp;
    temp = [];
  }
  return answersArray;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
