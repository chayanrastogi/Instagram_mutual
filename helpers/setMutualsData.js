const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const InstagramData = require('../model/instagramUserData');
const axios = require('axios');

const apiKeys = ['ssLCEY9ff55P1pjqQoKQrLbSlHgb6mRH', '7yGAalsi7sanK6Smoi0K1JhtXBrk6Hf3', 'cUq1FxLmb0dMWVwcFGCFRhL7Ac32viDq'];
function getRandomApiKey() {
    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[randomIndex];
}

let apiKey = getRandomApiKey();

// async function getMutual(user_id, pk) {
//     try {
//         let mutuals = [];
//         let following = [];
//         let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}`;
//         let headers = {
//             'Accept': 'application/json',
//             'x-access-key': apiKey
//         };

//         const response = await axios.get(url, { headers });
//         const data = response.data;
//         following.push(...data[0]);
//         let max_id = data[1];
//         while (max_id) {
//             try {
//                 let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
//                 let headers = {
//                     'Accept': 'application/json',
//                     'x-access-key': apiKey
//                 };

//                 const response = await axios.get(url, { headers });
//                 const data = response.data;
//                 following.push(...data[0]);
//                 max_id = data[1]
//             } catch (error) {
//                 console.log(error)
//                 let retry = 3;
//                 while (retry > 0) {
//                     let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
//                     let headers = {
//                         'Accept': 'application/json',
//                         'x-access-key': apiKey
//                     };

//                     const response = await axios.get(url, { headers });
//                     const data = response.data;
//                     following.push(...data[0]);
//                     max_id = data[1]
//                     --retry;
//                     if (!max_id) {
//                         retry = 0;
//                     }
//                 }
//             }
//         }

//         for (var user of following) {
//             if (user.is_private === true) {
//                 continue;
//             } else {
//                 try {
//                     let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={pk_id:${user.pk}}`;
//                     let headers = {
//                         'Accept': 'application/json',
//                         'x-access-key': apiKey
//                     };

//                     const response = await axios.get(url, { headers });
//                     const data = response.data;
//                     if (data) {
//                         mutuals.push(user);
//                     }
//                 } catch (error) {
//                     console.log(error)
//                     let retry = 3;
//                     while (retry > 0) {
//                         let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={pk_id:${user.pk}}`;
//                         let headers = {
//                             'Accept': 'application/json',
//                             'x-access-key': apiKey
//                         };

//                         const response = await axios.get(url, { headers });
//                         const data = response.data;
//                         if (data) {
//                             mutuals.push(user);
//                         }
//                         --retry;
//                         if (!data) {
//                             retry = 0;
//                         }
//                     }
//                 }
//             }
//         }

//         await InstagramData.upsert({
//             id: user_id,
//             mutuals: mutuals,
//             processed: true,
//         });

//     } catch (error) {
//         console.log(error);
//         getMutual(user_id, pk);
//     }
// }


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

        while (max_id) {
            try {
                let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
                const response = await axios.get(url, { headers });
                const data = response.data;
                following.push(...data[0]);
                max_id = data[1];
            } catch (error) {
                console.log(error);
                let errorData = error.response.data.exec_type;
                let retry = 3;
                while (retry > 0 && errorData === 'InsufficientFunds') {
                    let url = `https://api.hikerapi.com/v1/user/following/chunk?user_id=${pk}&max_id=${max_id}`;
                    let headers = {
                        'Accept': 'application/json',
                        'x-access-key': apiKey
                    };

                    const response = await axios.get(url, { headers });
                    const data = response.data;
                    following.push(...data[0]);
                    max_id = data[1]
                    --retry;
                    if (!max_id) {
                        retry = 0;
                    }
                }
            }
        }

        // If following array has at least 10 elements, split into chunks
        if (following.length >= 10) {
            const chunkSize = 10;
            const followingChunks = [];
            for (let i = 0; i < following.length; i += chunkSize) {
                followingChunks.push(following.slice(i, i + chunkSize));
            }

            // Process each chunk in parallel
            await Promise.all(followingChunks.map(async (chunk) => {
                for (const user of chunk) {
                    if (user.is_private === true) {
                        continue;
                    } else {
                        try {
                            let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={pk_id:${user.pk}}`;
                            const response = await axios.get(url, { headers });
                            const data = response.data;
                            if (data) {
                                mutuals.push(user);
                            }
                        } catch (error) {
                            console.log(error);
                            let retry = 3;
                            while (retry > 0) {
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
                                --retry;
                                if (!data) {
                                    retry = 0;
                                }
                            }
                        }
                    }
                }
            }));
        } else {
            // Process all users directly if following array length < 10
            for (const user of following) {
                if (user.is_private === true) {
                    continue;
                } else {
                    try {
                        let url = `https://api.hikerapi.com/v1/user/search/followers?user_id=${pk}&query={pk_id:${user.pk}}`;
                        const response = await axios.get(url, { headers });
                        const data = response.data;
                        if (data) {
                            mutuals.push(user);
                        }
                    } catch (error) {
                        console.log(error);
                        let retry = 3;
                        while (retry > 0) {
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
                            --retry;
                            if (!data) {
                                retry = 0;
                            }
                        }
                    }
                }
            }
        }

        // Upsert mutuals data to database
        await InstagramData.upsert({
            id: user_id,
            mutuals: mutuals,
            processed: true,
        });
    } catch (error) {
        console.log(error);
    }
}



const setMutualsData = async (req, res) => {
    try {
        const { username } = req.params;
        let user_id;
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
                user_id = pk;
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
                user_id = pk;
                isPrivate = data.is_private;
            } catch (error) {
                console.log(error)
                return res.status(400).json({
                    status: "failed",
                    message: "Error in fetching details or the account does not exist"
                })
            }
        }

        const foundUser = await InstagramData.findOne({ where: { id: user_id } });
        if (foundUser) {
            return res.status(200).json({
                status: "success",
                message: "Mutuals have been retrieved",
                userId: pk,
            });
        }

        if (!isPrivate) {
            await db.query("INSERT INTO instagram_user_data (id, processed, created_at) VALUES (:user_id, false, NOW())", {
                replacements: { user_id }
            });
            // Send an immediate response to the user
            res.status(202).json({ message: "Mutuals are being retrieved", userId: pk });
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