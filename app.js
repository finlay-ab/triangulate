import { apiKey } from './config.js';

console.log("Hello World!");

const requestOptions = {
  method: "GET",
  redirect: "follow"
};

var userCountryCode = "";
var userLatitude = "";
var userLongitude = "";
var biasParam = "";

// get ip location 
fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`, requestOptions)
  .then((response) => response.json())
  .then((result) => {
          userLatitude = result.location?.latitude;
          userLongitude = result.location?.longitude;

          console.log("userLatitude: " + userLatitude);
          console.log("userLongitude: " + userLongitude);

          if (userLatitude && userLongitude) 
          {
            biasParam = `&bias=proximity:${userLongitude},${userLatitude}`;
          }
  })
  .catch((error) => console.error("IP Error:", error));

const searchInput = document.getElementById("search-input");
let debounceTimer;
let currentController = null;

if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        const userInput = event.target.value.trim();

        // restart timer each keystroke
        clearTimeout(debounceTimer);

        // cancels previous api requests 
        if (currentController) {
            currentController.abort();
        }
        
        // make sure atleast 3 chars are in input (needs to be 3 for post codes)
        if (!userInput || userInput.length < 3) return;

        // Wait 1000ms before sending another message
        debounceTimer = setTimeout(() => {
            currentController = new AbortController();
            const encodedText = encodeURIComponent(userInput);

            fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedText}&limit=5&format=json${biasParam}&apiKey=${apiKey}`, {
                ...requestOptions,
                signal: currentController.signal
            })
              .then((response) => response.json()) 
              .then((result) => console.log("Preset API Result:", result))
              .catch((error) => {
                  if (error.name !== "AbortError") {
                      console.error("Error:", error);
                  }
              });
        }, 1000);
    });
}