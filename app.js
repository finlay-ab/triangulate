import { apiKey } from './config.js';

console.log("Hello World!");

const requestOptions = {
  method: "GET",
  redirect: "follow"
};


const presetSearchText = "264 Ryebank Road";
const encodedText = encodeURIComponent(presetSearchText);

fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedText}&limit=5&format=json&apiKey=${apiKey}`, requestOptions)
  .then((response) => response.json()) 
  .then((result) => console.log("Preset API Result:", result))
  .catch((error) => console.error("Error:", error));