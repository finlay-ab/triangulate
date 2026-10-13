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
var savedAddresses = [];
var currentResults = [];

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
const resultsDropdown = document.getElementById("results-dropdown");
let debounceTimer;
let currentController = null;

function selectAddress(item) {
    const addressText = item.formatted;
    console.log("Added to saved list:", addressText);
    
    savedAddresses.push(item);
    console.log("Current Saved Addresses List:", savedAddresses);
    
    searchInput.value = addressText;
    clearDropdown();
}

function clearDropdown() {
    currentResults = [];
    if (resultsDropdown) {
        resultsDropdown.innerHTML = "";
        resultsDropdown.style.display = "none";
    }
}

function renderDropdown(results) {
    if (!resultsDropdown) return;
    resultsDropdown.innerHTML = "";

    if (!results || results.length === 0) {
        resultsDropdown.style.display = "none";
        return;
    }

    resultsDropdown.style.display = "block";

    results.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.formatted;
        li.style.padding = "8px";
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            selectAddress(item);
        });

        resultsDropdown.appendChild(li);
    });
}

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
        if (!userInput || userInput.length < 3) {
            clearDropdown();
            return;
        }

        // Wait 1000ms before sending another message
        debounceTimer = setTimeout(() => {
            currentController = new AbortController();
            const encodedText = encodeURIComponent(userInput);

            fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedText}&limit=5&format=json${biasParam}&apiKey=${apiKey}`, {
                ...requestOptions,
                signal: currentController.signal
            })
              .then((response) => response.json()) 
              .then((result) => {
                  console.log("Preset API Result:", result);
                  currentResults = result.results || [];
                  renderDropdown(currentResults);
              })
              .catch((error) => {
                  if (error.name !== "AbortError") {
                      console.error("Error:", error);
                  }
              });
        }, 1000);
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            if (currentResults.length > 0) {
                selectAddress(currentResults[0]);
            }
        }
    });
}