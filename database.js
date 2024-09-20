const moongoes = require("mongoose");
const Schema  =  moongoes.Schema;
const ObjectId  = Schema.ObjectId;

const User= new Schema({
    name: String,
    email:{type:String, unique:true},
    password:String
})

const Todo = new Schema({
    userId:ObjectId,
    title:String,
    done:Boolean
})

//creating the models
const UserModel = moongoes.model("users",User);
const TodoModel = moongoes.model("todos", Todo);

//model export to access by others
module.exports = {
    UserModel: UserModel,
    TodoModel: TodoModel
};