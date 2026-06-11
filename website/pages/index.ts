import { send } from "clientUtilities";
import { Movie } from "types";

console.log("INDEX UPDATED");

const token = localStorage.getItem("userToken");

let currentUser: any = null;

const logoutButton =
    document.querySelector<HTMLButtonElement>("#logoutButton")!;

const floatingButton =
    document.querySelector<HTMLButtonElement>("#floatingButton")!;

const movieModal =
    document.querySelector<HTMLDivElement>("#movieModal")!;

const closeModalButton =
    document.querySelector<HTMLButtonElement>("#closeModalButton")!;

const movieModalDetails =
    document.querySelector<HTMLDivElement>("#movieModalDetails")!;

const favoritesButton =
    document.querySelector<HTMLButtonElement>("#favoritesButton")!;

const watchLaterButton =
    document.querySelector<HTMLButtonElement>("#watchLaterButton")!;

if (token == null) {
    location.href = "loginsignup.html";
}

floatingButton.onclick = function (): void {
    location.href = "add-movie.html";
};

// טעינת המשתמש המחובר ושמירתו במשתנה כדי לדעת מי הוסיף כל סרט
async function loadUser(): Promise<void> {

    const user = await send<any>("getUser", token);

    if (user == null) {
        localStorage.removeItem("userToken");
        location.href = "loginsignup.html";
        return;
    }

    currentUser = user;

    const usernameSpan =
        document.getElementById("usernameSpan") as HTMLSpanElement;

    usernameSpan.innerText = user.name;
}

// טעינת כל הסרטים לעמוד הראשי
async function loadMovies(): Promise<void> {

    const container =
        document.getElementById("moviesContainer") as HTMLElement;

    const movies: Movie[] =
        await send<Movie[]>("getMovies", null);

    container.innerHTML = "";

    if (movies.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No movies yet. Click + to add your first movie.
            </p>
        `;
        return;
    }

    movies.forEach((movie: Movie) => {

        const card =
            document.createElement("div");

        card.className = "movie-card";

        // בעמוד הראשי מציגים רק את תמונת הסרט
        card.innerHTML = `
            <img class="movie-image" src="${movie.image}" alt="${movie.title}">
        `;

        const movieImage =
            card.querySelector(".movie-image") as HTMLImageElement;

        // לחיצה על הסרט פותחת את החלון הלבן
        movieImage.onclick = function (): void {
            openMovieDetails(movie);
        };

        container.appendChild(card);
    });
}

// מחזיר id של סרט
function getMovieId(movie: Movie): number {
    return (movie as any).id ?? (movie as any).Id;
}

// מחזיר את id של המשתמש שהוסיף את הסרט
function getMovieOwnerId(movie: Movie): number {
    return (movie as any).userId ?? (movie as any).UserId;
}

// בדיקה האם המשתמש המחובר הוא מי שהוסיף את הסרט
function isMovieOwner(movie: Movie): boolean {

    if (currentUser == null) {
        return false;
    }

    const currentUserId =
        currentUser.id ?? currentUser.Id;

    const movieOwnerId =
        getMovieOwnerId(movie);

    return currentUserId === movieOwnerId;
}

// פתיחת חלון עם פרטי סרט
async function openMovieDetails(movie: Movie): Promise<void> {

    const movieId =
        getMovieId(movie);

    const isFavorite =
        await send<boolean>(
            "isFavorite",
            token,
            movieId
        );

    const isWatchLater =
        await send<boolean>(
            "isWatchLater",
            token,
            movieId
        );

    const personalScore =
        await send<number | null>(
            "getPersonalScore",
            token,
            movieId
        );

    const globalScore =
        await send<number | null>(
            "getGlobalScore",
            movieId
        );

    // אם המשתמש המחובר הוא מי שהוסיף את הסרט — נוסיף כפתור מחיקה
    const deleteButtonHtml =
        isMovieOwner(movie)
            ? `
                <button id="deleteMovieButton" class="modal-delete-button">
                    Delete Movie
                </button>
            `
            : "";

    movieModalDetails.innerHTML = `
        <div class="modal-layout">

            <div class="modal-info">

                <h2>${movie.title}</h2>

                <p class="movie-director">
                    <b>Director:</b> ${movie.director}
                </p>

                <p class="movie-year">
                    <b>Year:</b> ${movie.year}
                </p>

                <p class="movie-description">
                    ${movie.description}
                </p>

                <div class="rating-section">
                    <h3>Your Rating</h3>
                    <div id="personalRatingDiv" class="rating-stars"></div>
                </div>

                <div class="rating-section">
                    <h3>Average Rating</h3>
                    <div id="globalRatingDiv" class="rating-stars"></div>
                </div>

                <div class="future-buttons">

                    <button id="favoriteActionButton" class="future-button">
                    </button>

                    <button id="watchLaterActionButton" class="future-button">
                    </button>

                </div>

            </div>

            <div class="modal-image-box">
                <img class="modal-movie-image" src="${movie.image}" alt="${movie.title}">

                ${deleteButtonHtml}
            </div>

        </div>
    `;

    const favoriteActionButton =
        document.querySelector<HTMLButtonElement>("#favoriteActionButton")!;

    const watchLaterActionButton =
        document.querySelector<HTMLButtonElement>("#watchLaterActionButton")!;

    updateFavoriteButton(favoriteActionButton, isFavorite);
    updateWatchLaterButton(watchLaterActionButton, isWatchLater);

    favoriteActionButton.onclick = async function (): Promise<void> {

        const currentlyFavorite =
            favoriteActionButton.classList.contains("selected-action");

        const newValue =
            !currentlyFavorite;

        await send<boolean>(
            "setFavorite",
            token,
            movieId,
            newValue
        );

        updateFavoriteButton(favoriteActionButton, newValue);
    };

    watchLaterActionButton.onclick = async function (): Promise<void> {

        const currentlyWatchLater =
            watchLaterActionButton.classList.contains("selected-action");

        const newValue =
            !currentlyWatchLater;

        await send<boolean>(
            "setWatchLater",
            token,
            movieId,
            newValue
        );

        updateWatchLaterButton(watchLaterActionButton, newValue);
    };

    // חיבור כפתור המחיקה רק אם הוא באמת קיים בחלון
    const deleteMovieButton =
        document.querySelector<HTMLButtonElement>("#deleteMovieButton");

    if (deleteMovieButton != null) {

        deleteMovieButton.onclick = async function (): Promise<void> {

            const confirmed =
                confirm("Are you sure you want to delete this movie?");

            if (!confirmed) {
                return;
            }

            const success =
                await send<boolean>(
                    "deleteMovie",
                    token,
                    movieId
                );

            if (success) {
                closeMovieModal();
                await loadMovies();
            }
            else {
                alert("Movie was not deleted");
            }
        };
    }

    createPersonalStars(movieId, personalScore);
    createGlobalStars(globalScore);

    openMovieModal();
}

// פתיחת חלון Favorites
async function openFavoritesModal(): Promise<void> {

    const movies: Movie[] =
        await send<Movie[]>(
            "getFavoriteMovies",
            token
        );

    openMovieListModal("Favorites", movies);
}

// פתיחת חלון Watch Later
async function openWatchLaterModal(): Promise<void> {

    const movies: Movie[] =
        await send<Movie[]>(
            "getWatchLaterMovies",
            token
        );

    openMovieListModal("Watch Later", movies);
}

// פתיחת רשימת סרטים בתוך אותו מלבן לבן
function openMovieListModal(title: string, movies: Movie[]): void {

    let moviesHtml = "";

    if (movies.length === 0) {
        moviesHtml = `
            <p class="empty-message">
                No movies here yet.
            </p>
        `;
    }
    else {
        movies.forEach((movie: Movie) => {

            moviesHtml += `
                <div class="modal-list-card">
                    <img class="modal-list-image" src="${movie.image}" alt="${movie.title}">
                    <p>${movie.title}</p>
                </div>
            `;
        });
    }

    movieModalDetails.innerHTML = `
        <h2 class="modal-list-title">${title}</h2>

        <div class="modal-list">
            ${moviesHtml}
        </div>
    `;

    const listImages =
        document.querySelectorAll<HTMLImageElement>(".modal-list-image");

    listImages.forEach((image, index) => {

        image.onclick = function (): void {
            openMovieDetails(movies[index]);
        };
    });

    openMovieModal();
}

// שינוי כפתור Favorites לפי מצב
function updateFavoriteButton(button: HTMLButtonElement, isFavorite: boolean): void {

    if (isFavorite) {
        button.innerText = "Added to Favorites";
        button.classList.add("selected-action");
    }
    else {
        button.innerText = "Add to Favorites";
        button.classList.remove("selected-action");
    }
}

// שינוי כפתור Watch Later לפי מצב
function updateWatchLaterButton(button: HTMLButtonElement, isWatchLater: boolean): void {

    if (isWatchLater) {
        button.innerText = "Added to Watch Later";
        button.classList.add("selected-action");
    }
    else {
        button.innerText = "+ Watch Later";
        button.classList.remove("selected-action");
    }
}

// יצירת כוכבים לדירוג אישי
function createPersonalStars(movieId: number, personalScore: number | null): void {

    const personalRatingDiv =
        document.querySelector<HTMLDivElement>("#personalRatingDiv")!;

    personalRatingDiv.innerHTML = "";

    const cancelButton =
        document.createElement("span");

    cancelButton.className = "remove-rating";
    cancelButton.innerText = "×";

    cancelButton.onclick = async function (): Promise<void> {

        await send<boolean>(
            "removeRating",
            token,
            movieId
        );

        await openMovieDetailsById(movieId);
    };

    personalRatingDiv.appendChild(cancelButton);

    for (let i = 1; i <= 5; i++) {

        const star =
            document.createElement("span");

        star.className = "star";

        if (personalScore != null && personalScore >= i) {
            star.innerText = "★";
        }
        else {
            star.innerText = "☆";
        }

        star.onclick = async function (): Promise<void> {

            await send<boolean>(
                "setRating",
                token,
                movieId,
                i
            );

            await openMovieDetailsById(movieId);
        };

        personalRatingDiv.appendChild(star);
    }
}

// יצירת כוכבים לדירוג ממוצע
function createGlobalStars(globalScore: number | null): void {

    const globalRatingDiv =
        document.querySelector<HTMLDivElement>("#globalRatingDiv")!;

    globalRatingDiv.innerHTML = "";

    if (globalScore == null) {

        const noRatingText =
            document.createElement("span");

        noRatingText.className = "rating-number";

        noRatingText.innerText = "No ratings yet";

        globalRatingDiv.appendChild(noRatingText);

        return;
    }

    const roundedScore =
        Math.round(globalScore * 2) / 2;

    for (let i = 1; i <= 5; i++) {

        const star =
            document.createElement("span");

        star.className = "global-star";

        if (roundedScore >= i) {
            star.innerText = "★";
        }
        else if (roundedScore >= i - 0.5) {
            star.innerText = "⯨";
        }
        else {
            star.innerText = "☆";
        }

        globalRatingDiv.appendChild(star);
    }

    const ratingNumber =
        document.createElement("span");

    ratingNumber.className = "rating-number";

    ratingNumber.innerText = `${globalScore.toFixed(1)}/5`;

    globalRatingDiv.appendChild(ratingNumber);
}

// פתיחה מחדש של סרט לפי id אחרי שינוי דירוג
async function openMovieDetailsById(movieId: number): Promise<void> {

    const movies =
        await send<Movie[]>("getMovies", null);

    const movie =
        movies.find(movie => getMovieId(movie) === movieId);

    if (movie != null) {
        await openMovieDetails(movie);
    }
}

// פתיחת החלון הקופץ
function openMovieModal(): void {
    movieModal.style.display = "flex";
}

// סגירת החלון הקופץ
function closeMovieModal(): void {
    movieModal.style.display = "none";
    movieModalDetails.innerHTML = "";
}

// התנתקות
function logout(): void {
    localStorage.removeItem("userToken");
    location.href = "loginsignup.html";
}

// טעינת העמוד
window.onload = async (): Promise<void> => {
    await loadUser();
    await loadMovies();
};

// חיבור כפתורים
logoutButton.onclick = logout;
closeModalButton.onclick = closeMovieModal;
favoritesButton.onclick = openFavoritesModal;
watchLaterButton.onclick = openWatchLaterModal;

// סגירת חלון בלחיצה על הרקע
movieModal.onclick = function (event: MouseEvent): void {
    if (event.target === movieModal) {
        closeMovieModal();
    }
};