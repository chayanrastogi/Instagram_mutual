const axios = require('axios');


const apiKeys = ['', '7yGAalsi7sanK6Smoi0K1JhtXBrk6Hf3', 'cUq1FxLmb0dMWVwcFGCFRhL7Ac32viDq'];
function getRandomApiKey() {
    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[randomIndex];
}
let apiKey = 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH';

async function getUserProfileData(id) {
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

const getUserProfile = async (req, res) => {
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
        const response = await getUserProfileData(containsOnlyNumbers ? id : pk);
        console.log(response)
        res.json(response);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = getUserProfile;