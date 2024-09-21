const express = require("express");
const app = express();
const moongoes = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const JWT_SECRET = " todosecretkey";
const path = require('path');

const bodyParser = require('body-parser');


//impot the models
const { UserModel, TodoModel } = require("./database");
const { error } = require("console");
//connecting the database

moongoes.connect("");

// Serve static files (HTML, CSS, JS) from multiple directories
app.use(express.static(path.join(__dirname, "frontTodo"))); // For your main To-Do app
app.use(express.static(path.join(__dirname, "signin"))); // For Sign-in
app.use(express.static(path.join(__dirname, "signup"))); // For Sign-up


//middleware
app.use(express.json());
app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontTodo/frontend.html"));
})


app.post("/signup", (req, res) => {
    const requireBody = z.object({
        name: z.string().min(3).max(20),
        email: z.string().email(),
        password: z.string().min(4).max(20).optional(),
    });

    // parsing the body by safeParse
    const parsedBody = requireBody.safeParse(req.body);
    if (!parsedBody.success) {
        res.json({
            message: "Format is not correct"
        });
        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    // hashing the password
    bcrypt.hash(password, 5)
        .then(hashedPassword => {
            console.log("hashedPassword" + hashedPassword);

            // creating the user
            return UserModel.create({
                name: name,
                password: hashedPassword,
                email: email
            });
        })
        .then(() => {
           

            res.json({
                message: "User created successfully and signed up"
            });
        })
        .catch(error => {
            res.json({
                error: error
            });
        });
});




app.post("/signin", async (req, res) => {
    //checking to enter in signin rout
    console.log("Signin route hit");
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Check if user exists
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password is correct using await
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Password does not match");
            return res.status(403).json({ message: "Invalid password" });
        }

        // Generate a token upon successful sign-in
        const token = jwt.sign({
            id: user._id.toString(),
            email: user.email
        }, JWT_SECRET);

        console.log("Token generated:", token);

        // Send token to the client
        return res.json({
            message: "Successfully signed in",
            token: token
        });

    } catch (error) {
        console.error("Error during sign-in:", error);
        return res.status(500).json({ error: "Server error" });
    }
});



//creating the middleware

function authenticationMiddlware(req, res, next) {
    
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verify the token using JWT secret
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.user = decodedData; // Store the user ID from the decoded token for further use
        next();
    } catch (error) {
        // Handle invalid token errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).send({ message: "Invalid token" });
        } else {
            // Handle other errors
            console.error('Error verifying token:', error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

}

app.post("/todo", authenticationMiddlware, async (req, res) => {
    const userId = req.user.id;
    const title = req.body.title;

    try {

        console.log('User ID:', userId);
        console.log('Todo title:', title);
        // Create the todo item
        const todo = await TodoModel.create({
            title: title,
            userId: userId
        });

        // Respond with the created todo item
        res.status(201).json({
            message: "Todo created successfully",
            todo: todo
        });
    } catch (error) {
        // Handle errors
        console.error('Error creating todo:', error);
        res.status(500).json({ message: "Internal server error. Please try again." });
    }
})

app.get("/todos", authenticationMiddlware, async (req, res) => {
    const userId = req.body.userId;
    const title = req.body.title;
    const todo = await TodoModel.find({
        userId: userId
    });
    res.json({
        todo: todo,
        title: title
    })
})

app.post("/deletTodo", async (req, res) => {
    const userId = req.body.userId;
    const title = req.body.title;
    await TodoModel.deleteOne({
        userId,
        title
    }
    );
    res.json({
        "message": "todo has deleted"
    });
})


app.listen(3000, () => {
    console.log("server is running on port 3000");
});