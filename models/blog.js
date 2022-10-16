const mongoose = require(`mongoose`);
const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    img : {
        type : String,
        required : true
    },
    content : {
        type : String,
        required : true, 
        default : null
    }
})

module.exports = mongoose.model(`blogmod`, blogSchema);
