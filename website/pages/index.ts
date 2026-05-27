import { send } from "clientUtilities";
import { Movie } from "types";
// ==========================
// בדיקת משתמש מחובר
// ==========================

const token = localStorage.getItem("userToken");
const logoutButton = document.querySelector<HTMLButtonElement>("#logoutButton")!;
const floatingButton = document.querySelector<HTMLButtonElement>("#floatingButton")!;

floatingButton.onclick = function() {
    location.href = "add-movie.html";
}

// אם אין token → חוזרים ל-login
if (token == null) {

    location.href = "login.html";
}

// ==========================
// טעינת המשתמש
// ==========================

async function loadUser(): Promise<void> {

    const user = await send<any>("getUser", token);

    // אם token לא תקין
    if (user == null) {

        localStorage.removeItem("userToken");

        location.href = "login.html";

        return;
    }

    // מציג שם משתמש
    const usernameSpan =
        document.getElementById("usernameSpan") as HTMLSpanElement;

    usernameSpan.innerText = user.name;
}

// ==========================
// מעבר לעמוד הוספת סרט
// ==========================

function goToAddMovie(): void {

    window.location.href = "add-movie.html";
}

// ==========================
// טעינת סרטים
// ==========================

function loadMovies(): void {

    const container =
        document.getElementById("moviesContainer") as HTMLElement;

    const movies: Movie[] =
        JSON.parse(localStorage.getItem("movies") || "[]");

    container.innerHTML = "";

    movies.forEach((movie: Movie) => {

        const card: HTMLDivElement =
            document.createElement("div");

        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.director}</p>
            <p>${movie.description}</p>
        `;

        container.appendChild(card);
    });
}

// ==========================
// Logout
// ==========================

function logout(): void {

    localStorage.removeItem("userToken");

    location.href = "login.html";
}

// ==========================
// כשהעמוד נטען
// ==========================

window.onload = async () => {

    await loadUser();

    loadMovies();
};

logoutButton.onclick = function() {
    localStorage.removeItem("userToken");
    location.href = "loginsignup.html";    
};
// כדי שהכפתור יעבוד מה-HTML
(window as any).logout = logout;
(window as any).goToAddMovie = goToAddMovie;