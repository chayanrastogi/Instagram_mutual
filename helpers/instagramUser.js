const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const db = require('../db')
const InstagramMutuals = require('../model/instagramMutualsModel')

dotenv.config();

const app = express();
const apiKey = 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH'; 
var pk;

async function getDataAsync(item) {
    try {
        var reTry = true;
        var count = 5;
        var containsOnlyNumbers = /^\d+$/.test(item.username);

        if (!containsOnlyNumbers) {
            let url = `https://api.hikerapi.com/v1/user/by/username?username=${item.username}`;
            let headers = {
                'Accept': 'application/json',
                'x-access-key': apiKey
            };

            try {
                const response = await axios.get(url, { headers });
                const data = await response.data;

                if (data.length === 0) {
                    return null;
                }

                pk = data.pk;
            } catch (e) {
                console.log(e);
                return null;
            }
        }
        let temp = null;
        reTry = true;
        count = 3;

        while (reTry && count > 0) {

            try {
                url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${containsOnlyNumbers ? item.username : pk}`;
                headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                const response = await axios.get(url, { headers });
                temp = response.data;
                reTry = false;
                return temp[0];
            } catch (e) {
                console.log("2-->", e, "Response-->", temp);
                count -= 1;
                if (count === 0) {
                    reTry = false;
                    return;
                }
            }
        }
        return;
    } catch (e) {
        console.log("3-->", e);
        count -= 1;
        url = `https://api.hikerapi.com/v1/user/by/username?username=${pk}`;
        headers = {
            'Accept': 'application/json',
            'x-access-key': apiKey
        };
        await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep for 10 seconds
        if (count === 0) {
            reTry = false;
            return;
        }
    }
}

async function fetchAll(userFollowing) {
    let tasks = [];
    for (let item of userFollowing) {
        tasks.push(getDataAsync(item));
    }
    let res = await Promise.all(tasks);
    return res;
}

async function getMutual(user_id, userFollowing) {
    try {
        let result = await fetchAll(userFollowing);

        let mutualsFollowers = []
        for (let item of await result[0]) {
            let url = `https://api.hikerapi.com/v1/user/by/username?username=${item.username}`;
            let headers = {
                'Accept': 'application/json',
                'x-access-key': apiKey
            };
            const response = await axios.get(url, { headers });
            const data = await response.data;

            mutualsFollowers.push({ pk: data.pk, fullName: data.full_name, username: item.username, followers: data.follower_count });
        }
        const filterUser = mutualsFollowers.sort((a, b) => b.followers - a.followers);
        const topTenUsers = filterUser.slice(0, 10);

        await InstagramMutuals.upsert({
            user_id: user_id,
            mutuals_data: mutualsFollowers,
            top10_mutuals: topTenUsers.sort((a, b) => b.followers - a.followers)
        });

        return {
            message: "Success",
            totalMutuals: result[0].length,
            mutualsData: mutualsFollowers,
            top10Mutuals: topTenUsers.sort((a, b) => b.followers - a.followers),
        };
    } catch (e) {
        console.error("Inside Main Block", e);
        return [];
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

// GET User Mutuals Data
app.get('/api/v1/mutual/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user_id = req.headers.user_id;   
        console.log(user_id)     
        const userFollowing = [{ username }];
        const mutualUsers = await getMutual(user_id, userFollowing);



        res.json(mutualUsers);
    } catch (error) {
        console.error("Error in /mutual route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//GET User Profile
app.get('/api/v1/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;    
        if (!id) {
            return res.status(400).json({ message: 'PK id is required' });
        }
        console.log(id)
        const response = await getUserProfile(id);
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
 
