import type { Movie } from "types";

// PREVIEW IMAGE

const imageInput =
    document.getElementById("image") as HTMLInputElement;

const previewImage =
    document.getElementById("previewImage") as HTMLImageElement;

imageInput.addEventListener("input", () => {

    previewImage.src = imageInput.value;

    previewImage.style.display = "block";
});

// SAVE MOVIE

function saveMovie(): void {

    const titleInput =
        document.getElementById("title") as HTMLInputElement;

    const directorInput =
        document.getElementById("director") as HTMLInputElement;

    const descriptionInput =
        document.getElementById("description") as HTMLTextAreaElement;

    const movie: Movie = {

        id: Date.now(),

        title: titleInput.value,

        director: directorInput.value,

        image: imageInput.value,

        description: descriptionInput.value
    };

    const movies: Movie[] =
        JSON.parse(localStorage.getItem("movies") || "[]");

    movies.push(movie);

    localStorage.setItem(
        "movies",
        JSON.stringify(movies)
    );

    // חזרה לדף הבית
    window.location.href = "index.html";
}

// BACK BUTTON

function goBack(): void {

    window.location.href = "index.html";
}

// HTML FUNCTIONS

(window as any).saveMovie = saveMovie;
(window as any).goBack = goBack;