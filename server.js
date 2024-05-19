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

function authTokenMiddleware(req, res, next) {
	// BEARER Token
	const auth_header = req.headers["authorization"];

	const access_token = auth_header && auth_header.split(" ")[1];
	if(access_token==null) {
		return res.sendStatus(401);
	}
	console.log(`authTokenMiddleware: access_token: ${access_token}`);

	jwt.verify(access_token, SECRET, (err, payload) => {
		console.log(`authTokenMiddleware: verify err: ${err}  user: ${JSON.stringify(payload)}`);
		if(err) {
			return res.sendStatus(403).json(err.toString());
		}
		req.user = payload.user;
		next();
	})
}

app.listen(PORT, () => {
	console.log(`Express is listening on port=${PORT}`);
});
