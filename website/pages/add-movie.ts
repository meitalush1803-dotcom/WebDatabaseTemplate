type Movie = {
    title: string;
    director: string;
    image: string;
    description: string;
};

function saveMovie(): void {
    const titleInput = document.getElementById("title") as HTMLInputElement;
    const directorInput = document.getElementById("director") as HTMLInputElement;
    const imageInput = document.getElementById("image") as HTMLInputElement;
    const descriptionInput = document.getElementById("description") as HTMLTextAreaElement;

    const movie: Movie = {
        title: titleInput.value,
        director: directorInput.value,
        image: imageInput.value,
        description: descriptionInput.value
    };

    const movies: Movie[] = JSON.parse(localStorage.getItem("movies") || "[]");

    movies.push(movie);

    localStorage.setItem("movies", JSON.stringify(movies));

    // מעבר חזרה לעמוד הראשי
    window.location.href = "index.html";
}