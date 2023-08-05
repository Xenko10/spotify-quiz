import express from "express";
import session from "express-session";
import axios from "axios";
import bodyParser from "body-parser";
import queryString from "node:querystring";

const app = express();
const port = 3000;

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

app.get("/", async (req, res) => {
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
      "&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
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
    console.error("Failed to make request:", error);
    res.render("index.ejs");
  }
});

app.get("/start-quiz", async (req, res) => {
  try {
    const result = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=40",
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );
    console.log(result.data);
    let correctAnswersArray = randomNumbers(10, result.data);
    console.log(correctAnswersArray);
    let answersArray = answers(correctAnswersArray);
    console.log(answersArray);
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
    tab[i] = Math.floor(Math.random() * 40);
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
      temp[j] = Math.floor(Math.random() * 40);
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

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
