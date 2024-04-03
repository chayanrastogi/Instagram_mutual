const axios = require('axios');

const apiKey = 'ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH';

async function getDataAsync(item) {
    try {
        let reTry = true;
        let count = 5;

        let url = `https://api.hikerapi.com/v1/user/by/username?username=${item.username}`;
        let headers = {
            'Accept': 'application/json',
            'x-access-key': apiKey
        };

        console.log("Fetching data for", item.username);

        while (reTry && count > 0) {
            try {
                console.log("Requesting URL:", url);
                const response = await axios.get(url, { headers });
                const data = response.data;
                console.log( "Data", data)
                if (data.length === 0) {
                    return null;
                }
                let pk = data.pk
                let temp = null;
                reTry = true;
                count = 3;

                while (reTry && count > 0) {
                    try {
                                url = `https://api.hikerapi.com/v2/user/followers?user_id=${pk}&page_id=`;
                                headers = {
                                    'Accept': 'application/json',
                                    'x-access-key': apiKey
                                };

                                console.log("Fetching additional data for", item.username);
                                const response = await axios.get(url, { headers });
                                temp = response.data;
                                console.log("Temp", temp)
                                reTry = false;
                                return temp;
            
                    } catch (e) {
                        console.log("Error fetching additional data:", e);
                        url = `https://api.hikerapi.com/v1/user/by/username?username=${item.username}`;
                        headers = {
                            'Accept': 'application/json',
                            'x-access-key': apiKey
                        };

                        console.log("2-->", e, "Response-->", temp);
                        count--;
                        if (count === 0) {
                            reTry = false;
                            return;
                        }
                    }
                }
                return;
            } catch (e) {
                console.log("Error fetching data:", e);
                count--;
                url = `https://api.hikerapi.com/gql/user/followers/chunk?user_id`;
                headers = {
                    'Accept': 'application/json',
                    'x-access-key': apiKey
                };

                console.log("Retrying in 10 seconds...");
                await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep for 10 seconds
                if (count === 0) {
                    reTry = false;
                    return;
                }
            }
        }
    } catch (e) {
        console.log("Unexpected error:", e);
        return null;
    }
}

async function fetchAll(userFollowing) {
    let mutuals = [];
    const promises = userFollowing.map(item => getDataAsync(item));
    const result = await Promise.all(promises);
    // console.log("Fetch All - ", result[0].response.users[0].username);
    result[0].response.users.forEach(obj1 => {
        const matchingObj = result[1].response.users.find(obj2 => obj2.username === obj1.username);
        if (matchingObj) {
            mutuals.push(matchingObj);
          }
    });
    // result[0][0].forEach(obj1 => {
    //     const matchingObj = result[1][0].find(obj2 => obj2.username === obj1.username);
    //     if (matchingObj) {
    //         mutuals.push(matchingObj);
    //       }
    // });
    return mutuals;
}

async function getMutual(userFollowing) {
    try {
        const result = await fetchAll(userFollowing);
        console.log("RESULT", result)
        console.log("the length of mutual result is", result.length);
        return result;
    } catch (e) {
        console.error("Inside Main Block", e);
        return [];
    }
}

// Example usage:
const userFollowing = [{ username: 'adityapandey4159' },{ username: 'imagix.photo.studio' }];

getMutual(userFollowing);
