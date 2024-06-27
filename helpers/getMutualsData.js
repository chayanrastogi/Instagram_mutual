const db = require('../db')
const InstagramData = require('../model/instagramUserData')

let percentage = 10;

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

        const status = await db.query("SELECT processed FROM instagram_users_data WHERE id = :userid",
            {
                replacements: { userid }
            });

        let interval = setInterval(() => {
            if (percentage >= 100) {
                clearInterval(interval);
            } else {
                percentage += 20;
            }

        }, 20000);

        if (status.length === 0 || status[0].length === 0 || status[0][0].processed !== true) {
            return res.status(200).send({
                status: "in-progress",
                percentage: percentage > 100 ? "80%" : percentage + "%",
                message: 'Data is not processed yet.'
            });
        } else {
            percentage = 10;
            const status = await db.query("SELECT mutuals FROM instagram_users_data WHERE id = :userid",
                {
                    replacements: { userid }
                });
            return res.status(200).send({
                status: "Success",
                percentage: "100%",
                data: status[0][0].mutuals,
            })
        }

    } catch (error) {
        console.error("Error in /mutual route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = getMutualsData;