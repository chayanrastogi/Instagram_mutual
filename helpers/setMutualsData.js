const { v4: uuidv4 } = require('uuid');
const db = require('../db')
const InstagramData = require('../model/instagramUserData')
const axios = require('axios');

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
        let max_id = data[1];
        if (max_id) {
            try {
                let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
                let headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                const response = await axios.get(url, { headers });
                const data = response.data;
                following.push(...data[0]);
            } catch (error) {
                console.log(error)
            }
        }
        
        for (var user of following) {
            if (user.is_private === true) {
                continue;
            } else {
                try {
                    let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={pk_id:${user.pk}}`;
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

    } catch (error) {
        console.log(error)
    }
}


const setMutualsData = async (req, res) => {
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
                return res.status(400).json({
                    status: "failed",
                    message: "Error in fetching details or the account does not exist"
                })
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
                return res.status(400).json({
                    status: "failed",
                    message: "Error in fetching details or the account does not exist"
                })
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
                status: "failed",
                message: "Cannot fetch mutuals, the account is Private"
            })
        }
        return;
    } catch (error) {
        console.error("Error in /mutual route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = setMutualsData;