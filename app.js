//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://pratikpriyansh:pratik@gettingstarted.j92gmfu.mongodb.net/todolistDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item", itemSchema);

const item1= new Item({
  name: "Welecome to your todolist" 
});

const item2= new Item({
  name: "Hit the + button to off a new item" 
});

const item3= new Item({
  name: "Hit this to delete an item"
});

const defaultitems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultitems);

app.get("/", function(req, res) {

  Item.find({}).then((results)=>{
    if(results.length===0){
      Item.insertMany(defaultitems).then((ans)=>{
        console.log("Successfully inserted");
      }).catch((Err)=>{
        console.log("Error");
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  }).catch((err)=>{
    console.log("Error");
  });
  

});

app.get("/:customListname", function(req,res){
  const customListname =  req.params.customListname ;
  
  List.findOne({name: customListname}).then((results)=>{
    if(!results){
      const list = new List({
        name : customListname,
        items: defaultitems 
      })
      List.insertMany(list);
      res.redirect("/"+customListname);
    }
    else{
      res.render("list", {listTitle: results.name, newListItems: results.items} )
    }
  })
})

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list ;
  const newitem = new Item({
    name: item
  });
  if(listName === "Today"){
    Item.insertMany(newitem);
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then((found)=>{
      // found.items.push(item);
      List.insertMany(newitem);
      res.redirect("/"+ listName);
    })
  }
  
  
});

app.post("/delete", function(req,res){
  const checkedId =  req.body.checkbox;
  const listName = req.body.listName ;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedId).then((x)=>{
      console.log("Removed");
      res.redirect("/");
    }).catch((err)=>{
      console.log("Error");
    })
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedId}}}).then((found)=>{
      res.redirect("/"+listName);
    })
  }
})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port , function() {
  console.log("Server started on port 3000");
});
