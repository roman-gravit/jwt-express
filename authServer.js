const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Loads `.env` file contents into process.env by default.
dotenv.config();

const PORT = process.env.PORT_SERVER2 ?? 4000; 
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "access_secret"; 
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET ?? "refresh_secret"; 

let refreshTokens = [];

const app = express();

// The express.json() function is a built-in middleware function in Express. 
// It parses incoming requests with JSON payloads and is based on body-parser. 
app.use(express.json());


const GenerateAccessToken = (user) => {
	const payload = {
		"id": 1,
		"user": user
	}
	console.log(`GenerateAccessToken payload ${JSON.stringify(payload)}`);
	return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m"});
}

const GenerateRefreshToken = (user) => {
	const payload = {
		"id": 2,
		"user": user
	}
	console.log(`GenerateRefreshToken payload ${JSON.stringify(payload)}`);
	return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d"});
}

app.post("/token", (req, res) => {
	const refresh_token = req.body.token;
	if(refresh_token==null) {
		return res.sendStatus(401);
	}

	if(!refreshTokens.includes(refresh_token)) {
		return res.sendStatus(401);
	}

	jwt.verify(refresh_token, REFRESH_SECRET, (err, payload) => {
		console.log(`/token: verify err: ${err}  user: ${JSON.stringify(payload)}`);
		if(err) {
			return res.sendStatus(403).json(err.toString());
		}

		const access_token = GenerateAccessToken(payload.user);
		return res.json({ 
			accessToken: access_token,
			refreshToken: refresh_token
		});
	})

});

app.post("/login", (req, res) => {
	const name = req.body.name;
	console.log(`/login name: ${name}`);
	const access_token = GenerateAccessToken(name);
	const refresh_token = GenerateRefreshToken(name);

	refreshTokens.push(refresh_token);

	return res.json({ 
		accessToken: access_token,
		refreshToken: refresh_token
	});
});

app.listen(PORT, () => {
	console.log(`Express is listening on port=${PORT}`);
});
