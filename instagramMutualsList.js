const express = require('express');
const dotenv = require('dotenv');
const setMutualsData = require("./helpers/setMutualsData");
const getMutualsData = require("./helpers/getMutualsData");
const getUserProfile = require("./helpers/getUserProfile");
const User = require("./model/user");
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
app.use(express.json());

//REGISTER New User
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

        if(existingUser){

            if(await bcrypt.compare(password, existingUser?.password)){
                return res.status(200).json({
                    message: "User logged in successfully",
                    user: existingUser
                });

            }else{
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
        console.log("Error in registering user",error);
        return res.status(500).json({
            message: "Error in registering user",
            error: error,
        });
    }
});


// SET User Mutuals Data
app.post('/api/v1/mutual/:username', setMutualsData);

//GET USER DATA
app.get('/api/v1/mutual/:userid', getMutualsData)

//GET User Profile
app.get('/api/v1/profile/:id', getUserProfile)


const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

