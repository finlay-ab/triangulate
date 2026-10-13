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

// Load saved addresses from session storage if any exist
var savedAddresses = JSON.parse(sessionStorage.getItem("savedAddresses")) || [];
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
const savedListContainer = document.getElementById("saved-addresses-list");
const clearAllBtn = document.getElementById("clear-all-btn");
const calculateBtn = document.getElementById("calculate-btn");

let debounceTimer;
let currentController = null;

// Helper to update session storage and refresh the UI list
function saveAndRender() {
    sessionStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));
    renderSavedList();
    console.log("Current Saved Addresses List:", savedAddresses);
}

function selectAddress(item) {
    const addressText = item.formatted;
    console.log("Added to saved list:", addressText);
    
    savedAddresses.push(item);
    saveAndRender();
    
    searchInput.value = ""; // clear input after selecting
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
        li.className = "list-group-item list-group-item-action";
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            selectAddress(item);
        });

        resultsDropdown.appendChild(li);
    });
}

// Render the saved addresses onto the page with delete buttons
function renderSavedList() {
    if (!savedListContainer) return;
    savedListContainer.innerHTML = "";

    savedAddresses.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        
        const textSpan = document.createElement("span");
        textSpan.textContent = item.formatted;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-sm btn-danger";
        
        // Delete individual item
        deleteBtn.addEventListener("click", () => {
            savedAddresses.splice(index, 1);
            saveAndRender();
        });

        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        savedListContainer.appendChild(li);
    });
}

// Clear all button handler
if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
        savedAddresses = [];
        saveAndRender();
    });
}

// Verify we have at least 2 addresses before allowing navigation to midpoint page
if (calculateBtn) {
    calculateBtn.addEventListener("click", (event) => {
        if (savedAddresses.length < 2) {
            event.preventDefault();
            alert("Please add at least 2 addresses to calculate a midpoint.");
        }
    });
}

// Initial render on page load
renderSavedList();

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