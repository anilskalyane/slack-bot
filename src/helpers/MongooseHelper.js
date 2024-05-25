var mongoose = require('mongoose');
 
// make a connection 
mongoose.connect('mongodb+srv://app_user:fjlT3weBIE41gF6D@hifives.aoxfr.mongodb.net/?retryWrites=true&w=majority');
 
// get reference to database
var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
    console.log("Connection Successful!");
     
    // define Schema
    var BookSchema = mongoose.Schema({
      name: String,
      price: Number,
      quantity: Number
    });
 
    // compile schema to model
    var Book = mongoose.model('Book', BookSchema, 'bookstore');
 
    // a document instance
    var book1 = new Book({ name: 'Introduction to Mongoose', price: 10, quantity: 25 });
 
    // save model to database
    await book1.save();
    console.log(book1.name + " saved to bookstore collection.");
});