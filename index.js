import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
console.log();

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    const access_token = req.query;
    if (Object.keys(access_token).length === 0) {
      res.render("index.ejs");
    } else {
      res.render("success.ejs", { access_token: access_token.code });
    }
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs");
  }
});

app.post("/get-auth", (req, res) => {
  try {
    let url =
      "https://accounts.spotify.com/authorize/" +
      "?client_id=" +
      req.body.clientId +
      "&response_type=code&redirect_uri=" +
      encodeURI("http://localhost:3000/") +
      "&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    res.redirect(url);
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs");
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
