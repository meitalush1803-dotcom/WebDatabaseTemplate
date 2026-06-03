import { send } from "clientUtilities";
import { Movie } from "types";

// בדיקה שהקובץ החדש באמת נטען
console.log("INDEX UPDATED");

// שמירת הטוקן של המשתמש המחובר
const token = localStorage.getItem("userToken");

// קבלת כפתור ההתנתקות מהעמוד
const logoutButton =
    document.querySelector<HTMLButtonElement>("#logoutButton")!;

// קבלת כפתור הפלוס מהעמוד
const floatingButton =
    document.querySelector<HTMLButtonElement>("#floatingButton")!;

// קבלת החלון הקופץ מהעמוד
const movieModal =
    document.querySelector<HTMLDivElement>("#movieModal")!;

// קבלת כפתור הסגירה של החלון הקופץ
const closeModalButton =
    document.querySelector<HTMLButtonElement>("#closeModalButton")!;

// אם אין משתמש מחובר — מחזירים אותו לעמוד התחברות
if (token == null) {
    location.href = "loginsignup.html";
}

// לחיצה על פלוס מעבירה לעמוד הוספת סרט
floatingButton.onclick = function (): void {
    location.href = "add-movie.html";
};

// טעינת פרטי המשתמש המחובר
async function loadUser(): Promise<void> {

    const user = await send<any>("getUser", token);

    if (user == null) {
        localStorage.removeItem("userToken");
        location.href = "loginsignup.html";
        return;
    }

    const usernameSpan =
        document.getElementById("usernameSpan") as HTMLSpanElement;

    usernameSpan.innerText = user.name;
}

// טעינת הסרטים מהשרת והצגתם בעמוד
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

        card.innerHTML = `
            <img class="movie-image" src="${movie.image}" alt="${movie.title}">

            <h3>${movie.title}</h3>

            <p>
                <b>Director:</b> ${movie.director}
            </p>

            <p>${movie.description}</p>

            <button class="delete-button">
                Delete Movie
            </button>
        `;

        // קבלת התמונה של הסרט
        const movieImage =
            card.querySelector(".movie-image") as HTMLImageElement;

        // לחיצה על התמונה פותחת חלון ריק
        movieImage.onclick = function (): void {
            openMovieModal();
        };

        // קבלת כפתור המחיקה
        const deleteButton =
            card.querySelector(".delete-button") as HTMLButtonElement;

        // לחיצה על הכפתור מוחקת את הסרט
        deleteButton.onclick = async function (): Promise<void> {

            const confirmed =
                confirm("Are you sure you want to delete this movie?");

            if (!confirmed) {
                return;
            }

            // לפעמים ה-id חוזר מהשרת כ-id ולפעמים כ-Id
            const movieId =
                (movie as any).id ?? (movie as any).Id;

            const success =
                await send<boolean>(
                    "deleteMovie",
                    movieId
                );

            if (success) {
                await loadMovies();
            }
            else {
                alert("Movie was not deleted");
            }
        };

        container.appendChild(card);
    });
}

// פתיחת החלון הקופץ
function openMovieModal(): void {
    movieModal.style.display = "flex";
}

// סגירת החלון הקופץ
function closeMovieModal(): void {
    movieModal.style.display = "none";
}

// התנתקות מהאתר
function logout(): void {
    localStorage.removeItem("userToken");
    location.href = "loginsignup.html";
}

// כשהעמוד נטען
window.onload = async (): Promise<void> => {
    await loadUser();
    await loadMovies();
};

// חיבור כפתור ההתנתקות
logoutButton.onclick = logout;

// חיבור כפתור הסגירה
closeModalButton.onclick = closeMovieModal;

// סגירת החלון בלחיצה על הרקע
movieModal.onclick = function (event: MouseEvent): void {
    if (event.target === movieModal) {
        closeMovieModal();
    }
};