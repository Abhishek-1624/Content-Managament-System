const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name :  'dle4eixff',//process.env.CLOUD_NAME,
  api_key :  '321722341639839',//process.env.CLOUD_API_KEY,
  api_secret :  'kAyyXZWPyly1EHUK_cR8FmVi6iI'//process.env.CLOUD_API_SECRET
}) 

module.exports = cloudinary;