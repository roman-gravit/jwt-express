const express = require("express");
const jwt = require("jsonwebtoken");
const posts = require("./posts");
const dotenv = require("dotenv");

// Loads `.env` file contents into process.env by default.
dotenv.config();

const PORT = process.env.PORT ?? 3000; 
const SECRET = process.env.ACCESS_TOKEN_SECRET ?? "default_secret"; 


const app = express();

// The express.json() function is a built-in middleware function in Express. 
// It parses incoming requests with JSON payloads and is based on body-parser. 
app.use(express.json());

app.get("/posts", authTokenMiddleware, (req, res) => {
	res.json(posts.filter((post) => {
		return post.username === req.user;
	}));
});

app.post("/login", (req, res) => {
	const username = req.body.username;
	//const user = { name: username };

	const access_token = jwt.sign({ username }, SECRET, { expiresIn: "24h"});

	return res.json({accessToken: access_token});

});


function authTokenMiddleware(req, res, next) {
	// BEARER Token
	const auth_header = req.headers["authorization"];
	const access_token = auth_header && auth_header.split(" ")[1];
	if(access_token==null) {
		return res.sendStatus(401);
	}

	jwt.verify(access_token, SECRET, (err, user) => {
		if(err) {
			return res.sendStatus(403).json(err.toString());
		}

		req.user = user.username;
		next();
	})
}

app.listen(PORT, () => {
	console.log(`Express is listening on port=${PORT}`);
});
