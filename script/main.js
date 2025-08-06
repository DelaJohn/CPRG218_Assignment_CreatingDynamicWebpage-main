/**
 * To complete this Assignment follow below steps
 * 1.) Go to: OMDB website (https://www.omdbapi.com/)
 * 2.) In top navigation menu select "API Key"
 * 3.) Select Free account type and give your email address.
 * 4.) Go to your mail box and find the mail from OMDB.
 * 5.) You will receive the API Key in your mail along with a link to activate your key. Select the link to activate your key
 * 6.) Update the "myApiKey" variable with the API key from your mail. IMPORTANT: Before uploading your code to Github or Brightspace, delete your key from this file.
 * 7.) There are 3 task in this that you have to complete. Discuss with your instructor to understand the task.
 */

const myApiKey = ""; // <<-- ADD YOUR API KEY HERE. DELETE THIS KEY before uploading your code on Github or Brightspace, 

const BASE_URL = "http://www.omdbapi.com";


document.addEventListener('DOMContentLoaded', addEventHandlers);    // calling addEventHandlers function once the html document is loaded.

/**
 * Gets the value entered in the search bar and pass that value to getMovies function.
 */
function searchHandler() {
    const inputTxt = document.getElementById("searchBar").value;
    console.log(`Text Entered: ${inputTxt}`);
    if (inputTxt != "") {
        clearPreviousResult();
        getMovies(inputTxt);
    }
}


/**
 * Add event handler to search icon and search bar. When user click the search icon or when user
 * press "Enter" key while typing in search bar, "searchHandler" function will be called
 */
function addEventHandlers() {
    console.log("Event handlers attached");

    document.getElementById("searchIconDiv").addEventListener("click", () => {
        console.log("Search icon clicked");
        searchHandler();
    });

    document.getElementById("searchBar").addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            console.log("Enter key pressed");
            searchHandler();
        }
    });
}


/**
 * Remove all the elements from "movieCards" section
 */
function clearPreviousResult() {
    const container = document.getElementById("movieCards");
    console.log(`Clearing ${container.childElementCount} movie cards...`);
    container.innerHTML = ""; // ← simpler, faster, safe
}


/**
 * Creates a new HTML element with optional classes and text content.
 *
 * @param {string} elementName - The tag name of the HTML element to create (e.g., 'div', 'p', 'img', 'h2').
 * @param {string[]} [classNames=[]] - An optional array of class names to add to the element.
 * @param {string} [contentText=''] - An optional string of text content to set for the element.
 * Note: For elements like 'img', 'input', etc., this will be ignored.
 * @returns {HTMLElement} The newly created HTML element.
 */
function createHtmlElement(elementName, classNames = [], contentText = '') {
    console.log(`CreateHtmlElement: ${elementName}`);
    
    // Step 1: Create the HTML element
    const htmlElement = document.createElement(elementName);
    
    // Step 2: Add classes
    classNames.forEach(className => htmlElement.classList.add(className));
    
    // Step 3: Add content (safely)
    if (contentText && !['img', 'input', 'br', 'hr'].includes(elementName.toLowerCase())) {
        htmlElement.textContent = contentText;
    }

    return htmlElement;
}



/**
 * Perform a fetch operation to OMDB API to get list of movies based on movieTitle user provided
 * 
 * @param {string} movieTitle - String user entered in the search bar.
 */
async function getMovies(movieTitle) {
    const API_URL = `${BASE_URL}/?apikey=${myApiKey}&s=${movieTitle}`;
    console.log("Calling API:", API_URL);

    try {
        const response = await fetch(API_URL);
        console.log("Response status:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("API Response:", data);

            const movieList = data.Search;

            if (!Array.isArray(movieList) || movieList.length === 0) {
                console.log("No movies found.");
                createEmptyView();
                return;
            }

            const moviePromises = movieList.map(movie => checkPosterURL(movie));
            const results = await Promise.allSettled(moviePromises);

            const filteredMovies = [];
            results.forEach(result => {
                if (result.status === "fulfilled" && result.value != null) {
                    const movieObj = result.value;
                    movieObj.Title = movieObj.Title.length > 40 ? `${movieObj.Title.substring(0, 40)}...` : movieObj.Title;
                    filteredMovies.push(movieObj);
                }
            });

            console.log("Filtered movies:", filteredMovies);

            if (filteredMovies.length === 0) {
                createEmptyView();
            } else {
                filteredMovies.forEach(movie => createMovieCard(movie));
            }
        }
    } catch (error) {
        console.error("Error in getMovies():", error);
    }
}



/**
 * Check the url of movie poster. If poster url is working then only we will create movie card.
 * 
 * @param {object} movie - The movie object from the list of movies received from OMDB API.
 * @returns {object || null} movie object if the poster url is working, null if poster url is not working
 */
async function checkPosterURL(movie) {
    try {
        const response = await fetch(movie.Poster);
        if (response.ok) {
            // Poster URL is working
            return movie;
        } else {
            // Poster URL is not correct
            return null;
        }
    } catch (error) {
        console.error("Error while checking poster URL");
        console.error(error);
        return null;
    }
}

/**
 * If the search operation does not create any movie card, call this method to create empty view. 
 * Create a "p" element and append it to "movieCards" section. The structure of p element is given below.
 * 
 *      <p class="noresult">No movie found!!! Please search for another title.</p>
 */
function createEmptyView() {
    console.log("createEmptyView");

    const container = document.getElementById("movieCards");

    const message = document.createElement("p");
    message.classList.add("noresult");
    message.textContent = "No movie found!!! Please search for another title.";

    container.appendChild(message);
}

/**
 * Create a movie card using the parameter. The card should have movie title and poster. The card should follow below structure:
 *      <article class="card">
 *          <p class="cardTitle">movie.Title</p>
 *          <div class="cardPosterDiv">
 *              <img class="moviePoster" src=movie.Poster alt="Movie poster">
 *          </div>
 *      </article>
 * 
 * @param {object} movie - The movie object from filteredMovie. The movie object will have a Title and a Poster url.
 */
function createMovieCard(movie) {
    console.log("createMovieCard");
    console.log(movie);

    const container = document.getElementById("movieCards");

    const card = document.createElement("article");
    card.classList.add("card");

    const title = document.createElement("p");
    title.classList.add("cardTitle");
    title.textContent = movie.Title;

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("cardPosterDiv");

    const posterImg = document.createElement("img");
    posterImg.classList.add("moviePoster");
    posterImg.src = movie.Poster;
    posterImg.alt = "Movie poster";

    posterDiv.appendChild(posterImg);
    card.appendChild(title);
    card.appendChild(posterDiv);

    container.appendChild(card);
}
