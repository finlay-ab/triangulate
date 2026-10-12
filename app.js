import { apiKey } from './config.js';

console.log("Hello World!");

const requestOptions = {
  method: "GET",
  redirect: "follow"
};

var userCountryCode = "";
var userLatitude = "";
var userLongitude = "";

// get ip location 
fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`, requestOptions)
  .then((response) => response.json())
  .then((result) => {
          userLatitude = result.location?.latitude;
          userLongitude = result.location?.longitude;

          console.log("userLatitude: " + userLatitude);
          console.log("userLongitude: " + userLongitude);

          let biasParam = ""
          if (userLatitude && userLongitude) 
          {
            biasParam = `&bias=proximity:${userLongitude},${userLatitude}`;
          }



    const presetSearchText = "264 Ryebank Road";
    const encodedText = encodeURIComponent(presetSearchText);

    return fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedText}&limit=5&format=json${biasParam}&apiKey=${apiKey}`, requestOptions);

  })
  .then((response) => response.json()) 
  .then((result) => console.log("Preset API Result:", result))
  .catch((error) => console.error("Error:", error));