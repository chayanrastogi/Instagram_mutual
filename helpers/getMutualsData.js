const db = require('../db')
const InstagramData = require('../model/instagramUserData')

const getMutualsData = async (req, res) => {
    try {
        const { userid } = req.params;
        if (!userid) {
            res.status(500).json({ message: "Please provide userId" });
        }

        const user = await InstagramData.findOne({
            where: {
                id: userid
            }
        })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User details not found in database"
            })
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
};

module.exports  = getMutualsData;