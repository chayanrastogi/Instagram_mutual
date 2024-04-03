const axios = require('axios');
const dotenv = require('dotenv');

const apiKey = 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH';
var pk;

async function getDataAsync(item) {
    try {
        let reTry = true;
        let count = 5;
        // const containsLetters = /^[a-zA-Z]+$/.test(str);
    
        let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${item.username}`;
        let headers = {
            'Accept': 'application/json',
            'x-access-key': apiKey
        };

        while (reTry && count > 0) {
            try {
                const response = await axios.get(url, { headers });
                const data = response.data;

                if (data.length === 0) {
                    return null;
                }
                console.log("USER", data);
                return;
            } catch (e) {
                console.log("3-->", e);
                count -= 1;
                url = `https://api.hikerapi.com/v1/user/by/username?username=${''}`;
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
    } catch (e) {
        console.log(e);
        return null;
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

async function getMutual(userFollowing) {
    try {
        let result = await fetchAll(userFollowing);
        // result = result.filter(x => x !== null);
        // console.log("RESULT", result[0][0])
      
        // return mutuals;
        // console.log("the length of mutual result is ", , mutuals.length);
    } catch (e) {
        console.error("Inside Main Block", e);
        return [];
    }
}

const userFollowing = [{ username: '1328730802'}];

getMutual(userFollowing);