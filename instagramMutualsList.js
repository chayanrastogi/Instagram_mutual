const express = require('express');
const dotenv = require('dotenv');
const setMutualsData = require("./helpers/setMutualsData");
const getMutualsData = require("./helpers/getMutualsData");
const getUserProfile = require("./helpers/getUserProfile");
const User = require("./model/user");
const bcrypt = require('bcrypt');
const axios = require('axios');
const moment = require('moment');
const InstagramData = require('./model/instagramUserData');

dotenv.config();

const app = express();
app.use(express.json());
InstagramData.sync();


//REGISTER/LOGIN User
app.post('/api/v1/user/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: "All credentials are required"
        });
    }

    try {
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {

            if (await bcrypt.compare(password, existingUser?.password)) {
                return res.status(200).json({
                    message: "User logged in successfully",
                    user: existingUser
                });

            } else {
                return res.status(400).json({
                    message: "Invalid credentials"
                });
            }

        }

        //hashed
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User created successfully",
            user: newUser
        });


    } catch (error) {
        console.log("Error in registering user", error);
        return res.status(500).json({
            message: "Error in registering user",
            error: error,
        });
    }
});

//UPDATE USER data
app.put('/api/v1/user/details/:email', async (req, res) => {
    const { email } = req.params;
    const { id } = req.body;

    if (!email) {
        return res.status(500).json({ message: "Email is required" });
    }

    if (!id) {
        return res.status(500).json({ message: "Search id is required" });
    }

    const user = await User.findOne({
        where:
        {
            email: email
        }
    });

    if (!user) {
        return res.status(404).json({ message: "No user of given email found" });
    }

let result;
    try {
        let url = `https://api.hikerapi.com/v1/user/by/id?id=${id}`
                let headers = {
                    'Accept': 'application/json',
                    'x-access-key': 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH'
                };

                const response = await axios.get(url, { headers });
                data = response.data;
                result = {
                    pk: data.pk,
                    full_name: data.full_name,
                    username: data.username,
                    time: moment().format('YYYY-MM-DD HH:mm:ss'),
                }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error in fetching details"});
    }

    let searches = user.dataValues.searches || [];
    searches.push(result);

    await User.update({
        searches
    },
        { where: { email }, returning: true }
    );

    return res.status(200).json({
        status: "Successfully added to search history",
        email: email,
        searches: searches,
    })
});

// GET USER searches
app.get('/api/v1/user/searches/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(500).json({ message: "Email is required" });
    }

    const user = await User.findOne({
        where:
        {
            email: email
        }
    });

    if (!user) {
        return res.status(404).json({ message: "No user of given email found" });
    }

    let search = await user.dataValues.searches;

    return res.status(200).json({
        status: "Successfully retrieved search history",
        email: email,
        searches: search,
    })
});

// SET Search Mutuals Data
app.post('/api/v1/mutual/:username', setMutualsData);

//GET Search DATA
app.get('/api/v1/mutual/:userid', getMutualsData)

//GET Search Profile
app.get('/api/v1/profile/:id', getUserProfile)


const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

