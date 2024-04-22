const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const db = require('../db')
const InstagramData = require('../model/instagramUserData')
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const apiKey = 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH';

async function getMutual(user_id, pk) {
    try {
        let mutuals = [];
        let following = [];
        let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}`;
        let headers = {
            'Accept': 'application/json',
            'x-access-key': apiKey
        };

        const response = await axios.get(url, { headers });
        const data = response.data;
        following.push(...data[0]);
        console.log("1-",following)
        // let max_id = data[1];
        // for(var i=0; i<5; i++){
        //     if (max_id) {
        //         try {
        //             let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
        //             let headers = {
        //                 'Accept': 'application/json',
        //                 'x-access-key': apiKey
        //             };
    
        //             const response = await axios.get(url, { headers });
        //             const data = response.data;
        //             following.push(...data[0]);
        //             max_id = data[1];
        //         } catch (error) {
        //             console.log(error)
        //         }
        //     }else{
        //         break;
        //     }
        // }
        // const set = new Set(following.map(JSON.stringify));
        // const unique =  Array.from(set).map(JSON.parse);
        // console.log(unique)
        for (var user of following) {
            if (user.is_private === true) {
                continue;
            } else {
                try {
                    let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={id:${user.pk}}`;
                    let headers = {
                        'Accept': 'application/json',
                        'x-access-key': apiKey
                    };

                    const response = await axios.get(url, { headers });
                    const data = response.data;
                    if (data) {
                        mutuals.push(user);
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        await InstagramData.upsert({
            id: user_id,
            mutuals: mutuals,
            processed: true,
        });
        return;
    } catch (error) {
        console.log(error)
    }
}


async function getUserProfile(id) {
    try {
        let url = `https://api.hikerapi.com/v1/user/by/id?id=${id}`
        let headers = {
            'Accept': 'application/json',
            'x-access-key': apiKey
        };

        const response = await axios.get(url, { headers });
        temp = response.data;
        return {
            message: "Success",
            status: 200,
            userProfile: temp,
        };
    } catch (error) {
        console.log(error)
        return {
            message: "Error in fetching User Profile",
            error: error,
        }
    }
};


// SET User Mutuals Data
app.post('/api/v1/mutual/:username', async (req, res) => {
    try {
        const { username } = req.params;
        user_id = uuidv4();
        let pk;
        let data;
        let isPrivate;
        const containsOnlyNumbers = /^[0-9]+$/.test(username);

        if (!containsOnlyNumbers) {
            try {
                let url = `https://api.hikerapi.com/v1/user/by/username?username=${username}`
                let headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                const response = await axios.get(url, { headers });
                data = response.data;
                pk = data.pk;
                isPrivate = data.is_private;
            } catch (error) {
                console.log(error)
            }
        } else {
            try {
                let url = `https://api.hikerapi.com/v1/user/by/id?id=${username}`
                let headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                const response = await axios.get(url, { headers });
                data = response.data;
                pk = data.pk;
                isPrivate = data.is_private;
            } catch (error) {
                console.log(error)
            }
        }

        if (!isPrivate) {
            await db.query("INSERT INTO instagram_user_data (id, processed, created_at) VALUES (:user_id, false, NOW())", {
                replacements: { user_id }
            });
            // Send an immediate response to the user
            res.status(202).json({ message: "Mutuals are being retrieved", userId: user_id });
            await getMutual(user_id, containsOnlyNumbers ? username : pk);
        } else {
            return res.status(400).json({
                message: "Cannot fetch mutuals, the account is Private"
            })
        }
        return;
    } catch (error) {
        console.error("Error in /mutual route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//GET USER DATA
app.get('/api/v1/mutual/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        if (!userid) {
            res.status(500).json({ message: "Please provide userId" });
        }

        const status = await db.query("SELECT processed FROM instagram_user_data WHERE id = :userid",
            {
                replacements: { userid }
            });

        if (status.length === 0 || status[0].length === 0 || status[0][0].processed !== true) {
            return res.status(200).send({
                status: "in-progress",
                message: 'Data is not processed yet.'
            });
        } else {
            const status = await db.query("SELECT mutuals FROM instagram_user_data WHERE id = :userid",
                {
                    replacements: { userid }
                });
            return res.status(200).send({
                status: "Success",
                data: status[0][0].mutuals.map(str => JSON.parse(str.replace(/\\/g, ''))),
            })
        }

    } catch (error) {
        console.error("Error in /mutual route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//GET User Profile
app.get('/api/v1/profile/:id', async (req, res) => {
    try {
        let pk;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'PK id is required' });
        }
        console.log(id)
        const containsOnlyNumbers = /^[0-9]+$/.test(id);
        if (!containsOnlyNumbers) {
            try {
                let url = `https://api.hikerapi.com/v1/user/by/username?username=${id}`
                let headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                const response = await axios.get(url, { headers });
                data = response.data;
                pk = data.pk;
                console.log(pk)
            } catch (error) {
                console.log(error)
            }
        }
        const response = await getUserProfile(containsOnlyNumbers ? id : pk);
        console.log(response)
        res.json(response);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})



const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

