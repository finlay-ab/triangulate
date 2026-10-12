import { apiKey } from './config.js';

console.log("Hello World!");

const requestOptions = {
  method: "GET",
  redirect: "follow"
};


fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`, requestOptions)
  .then((response) => response.json())
  .then((result) => {
      console.log("My IP Address:", result.ip);
      console.log("My Approximate Location:", {
          city: result.city?.name || "Unknown",
          state: result.state?.name || "Unknown",
          country: result.country?.name || "Unknown",
          latitude: result.location?.latitude || "Unknown",
          longitude: result.location?.longitude || "Unknown"
      });
  })
  .catch((error) => console.error("Error:", error));

const presetSearchText = "264 Ryebank Road";
const encodedText = encodeURIComponent(presetSearchText);

fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedText}&limit=5&format=json&apiKey=${apiKey}`, requestOptions)
  .then((response) => response.json()) 
  .then((result) => console.log("Preset API Result:", result))
  .catch((error) => console.error("Error:", error));