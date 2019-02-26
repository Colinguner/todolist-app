//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
var _ = require('lodash');

// __________________________________________________

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://***********nope**************",{useNewUrlParser:true});

// __________________________________________________

const itemsSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete item."
});
//Item.save();
const defaultItems = [item1, item2, item3];
const listSchema = {
  name:String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// __________________________________________________

app.get("/", function(req, res) {
  
  const day = date.getDate();

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("succesfully connected");
      }});
    res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });
});

// __________________________________________________

app.get("/:paramName", function(req,res){ 
  let paramName = _.capitalize(req.params.paramName);
  
  List.findOne({ name: paramName}, function (err, foundList) {
    if(!err){
      if(!foundList){
        console.log("doesnt exist");
        const list = new List({
          name:paramName,
          items: defaultItems
        });
        list.save();  
        res.redirect("/" + paramName);
      }
      else{
        console.log("exist");
        res.render("list.ejs", {listTitle: paramName, newListItems: foundList.items });
      }
    }
  });
});

// __________________________________________________

app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;
let itemNew = new Item({
    name: itemName
});
if(listName === date.getDate()){
    itemNew.save();
    res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, results){
    if(err){
      console.log(err);
    }else{
      results.items.push(itemNew);
      results.save();
      res.redirect("/"+ listName);
    }
  });
}
});

// __________________________________________________

 app.post("/delete", function(req, res){
    console.log(req.body.checkbox);
    const key = req.body.checkbox;
    const listName = req.body.listName;

  if(listName === date.getDate()){
    Item.deleteOne({_id:key}, function(err){
      if(err){console.log(err)}
      else{
        console.log("succesfully deleted by clicking checkbox");
        res.redirect("/");
      }
    })
  }
else{
  List.findOneAndUpdate({name:listName}, {$pull: {items:{_id: key}}}, function(err,results){
    if(!err){
      res.redirect("/"+listName);
    }
  });
  }
});  

// __________________________________________________

app.get("/about", function(req, res){
  res.render("about");
});

// __________________________________________________

let port = process.env.PORT;
if(port == null || port == ""){
  port=3000;
}


app.listen(port, function() {
  console.log("Server started succesfully");
});