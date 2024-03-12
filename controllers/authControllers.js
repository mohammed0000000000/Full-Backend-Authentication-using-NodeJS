const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const foundUser = await User.findOne({ email: email }).exec();

    if (foundUser) {
        return res.status(401).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPassword,
    });

    const accessToken = jwt.sign({
        userInfo: {
            id: user._id,
        },
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign({
        userInfo: {
            id: user._id,
        }
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });


    res.cookie("jwt", refreshToken, {
        httpOnly: true,// accessible only by web server
        secure: true, // access by https in production
        sameSite: "None",// sameSite == None cookie send to domain and sub domain, if strict only the current site
        maxAge: 1000 * 60 * 60 * 24 * 7, // 
    });
    res.json({ accessToken, email: user.email, first_name: user.first_name, last_name: user.last_name });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message:"All Faild Are require"});
    }
    const foundUser = await User.findOne({email:email}).exec();
    if (!foundUser) {
        return res.status(401).json({ message: "Invalid Email" });
    }
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        return res.status(401).json({message:"Invalid Password"});
    }

    const accessToken = jwt.sign(
        {
            userInfo: {
                id: foundUser._id,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            userInfo: {
                id: foundUser._id,
            },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        accessToken,
        email: foundUser.email,
    });
}
const refresh = (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshToken = cookies.jwt;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const foundUser = await User.findById(decoded.userInfo.id).exec();

        if (!foundUser)
            return res.status(403).json({ message: "Unauthorized" });

        const accessToken = jwt.sign(
            {
                userInfo: {
                    id: foundUser.id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json(accessToken);
    });
}

const logout = (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(201);
    }
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    })
    return res.status(200).json({ message: "Logout Successful" });
};
module.exports = {
    register, login, refresh, logout
}