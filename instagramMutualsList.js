const express = require('express');
const dotenv = require('dotenv');
const setMutualsData = require("./helpers/setMutualsData");
const getMutualsData = require("./helpers/getMutualsData");
const getUserProfile = require("./helpers/getUserProfile");
dotenv.config();

const app = express();

// SET User Mutuals Data
app.post('/api/v1/mutual/:username', setMutualsData);

//GET USER DATA
app.get('/api/v1/mutual/:userid', getMutualsData)

//GET User Profile
app.get('/api/v1/profile/:id', getUserProfile)


const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

