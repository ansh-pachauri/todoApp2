const express =require("express");
const app = express();
const moongoes = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const JWT_SECRET =" todosecretkey";
const path = require('path');
const cors = require('cors');

//impot the models
const {UserModel,TodoModel} = require("./database");
//connecting the database

moongoes.connect("mongodb+srv://admin:9DmQpZqSJS14MF52@cluster0.hnft8.mongodb.net/todo3");

// Serve static files (HTML, CSS, JS) from multiple directories
app.use(express.static(path.join(__dirname, "frontTodo"))); // For your main To-Do app
app.use(express.static(path.join(__dirname, "signin"))); // For Sign-in
app.use(express.static(path.join(__dirname, "signup"))); // For Sign-up


//middleware
app.use(express.json());
// app.use(cors({
//     origin: ["http://localhost:3000"],
// }));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"/frontTodo/frontend.html"));
})


//signup request using the zod
app.post("/signup", async (req,res)=>{
    const requireBody = z.object({
        name: z.string().min(3).max(20),
        email: z.string().email(),
        password: z.string().min(4).max(20).optional(),
    });
    //parsing the body by safe parse
    const parsedBody = requireBody.safeParse(req.body);
    if (!parsedBody.success) {
        res.json({
            message : "Formate is not correct"
        })
        return
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    //hashing the password

    try{const hashedPassword = await bcrypt.hash(password,5);
    console.log(hashedPassword);
    
    //creating the user
    await UserModel.create({
        name:name,
        password:hashedPassword,
        email:email
    });

    res.json({
        message : "User created successfully and sign uped"
    });}catch(error){
        res.json({
            error: error
        })
        
    }
})

app.post("/signin",async(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    //checking the user exist or not
    const response = await UserModel.findOne({
        email:email,
       
    });
    if(!response){
        res.json({
            message : "User not found"
        })
        return
    }
    //checking the password
    const isMatch =  bcrypt.compare(password,response.password);
    if(!isMatch){
        res.status(403).send({
            message : "Invalid password"
        })
    }else{
        const token = jwt.sign({
            id:response._id.toString()
        },JWT_SECRET);
        res.json({
            message : "succefullt signined",
            token: token
        });
    }
    console.log(isMatch);
})
//creating the middleware

function authenticationMiddlware(req,res,next) {
    // const token = req.headers.token;
    // const decodeData = jwt.verify(token,JWT_SECRET);
    // if(!decodeData){
    //     res.status(403).send({
    //         message : "Incorrect credentials"
    //     });
    // }else{
    //     req.userId = decodeData.id;
    //     next();
    // }
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  // Check if a token is present
  if (!token) {
    return res.status(401).send({ message: "Unauthorized: No token provided" }); // Send a 401 (Unauthorized) response
  }

  try {
    // Verify the token using JWT secret
    const decodedData = jwt.verify(token, JWT_SECRET);
    req.userId = decodedData.id; // Store the user ID from the decoded token for further use
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

app.post("/todo",authenticationMiddlware,async(req,res)=>{
    const userId = req.userId;
    const title = req.body.title;
    
    try {
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

app.get("/todos",authenticationMiddlware,async(req,res)=>{
    const userId = req.body.userId;
    const title =  req.body.title;
    const todo = await TodoModel.find({
        userId:userId
    });
    res.json({
        todo:todo,
        title :title
    })
})

app.post("/deletTodo",async(req,res)=>{
    const userId = req.body.userId;
    const title = req.body.title;
    await TodoModel.deleteOne({
        userId,
        title
    }
    );
    res.json({
        "message" : "todo has deleted"
    });
})


app.listen(3000,()=>{
    console.log("server is running on port 3000");
});