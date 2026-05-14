type Movie = {
    id: number;
    title: string;
    director: string;
    image: string;
    description: string;
};

function goToAddMovie(): void {
    window.location.href = "add-movie.html";
}

function loadMovies(): void {
    const container = document.getElementById("moviesContainer") as HTMLElement;

    const movies: Movie[] = JSON.parse(localStorage.getItem("movies") || "[]");

    container.innerHTML = ""; // מנקה לפני טעינה

    movies.forEach((movie: Movie) => {
        const card: HTMLDivElement = document.createElement("div");
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

// נטען כשהעמוד עולה
window.onload = loadMovies;