import { send } from "clientUtilities"; // יבוא פונקציית send שמדברת עם השרת
import { Movie } from "types"; // יבוא הטיפוס Movie מתוך קובץ types

console.log("INDEX WITHOUT INNERHTML"); // הודעה בקונסול כדי לדעת שהקובץ המעודכן נטען

const token = localStorage.getItem("userToken"); // שליפת הטוקן של המשתמש מהזיכרון המקומי

let currentUser: any = null; // משתנה שישמור את המשתמש המחובר כרגע

const logoutButton = document.querySelector<HTMLButtonElement>("#logoutButton")!; // כפתור התנתקות
const floatingButton = document.querySelector<HTMLButtonElement>("#floatingButton")!; // כפתור הפלוס
const moviesContainer = document.querySelector<HTMLElement>("#moviesContainer")!; // אזור הצגת הסרטים

const movieModal = document.querySelector<HTMLDivElement>("#movieModal")!; // הרקע של החלון הקופץ
const closeModalButton = document.querySelector<HTMLButtonElement>("#closeModalButton")!; // כפתור סגירת החלון

const movieDetailsView = document.querySelector<HTMLDivElement>("#movieDetailsView")!; // אזור פרטי סרט
const movieListView = document.querySelector<HTMLDivElement>("#movieListView")!; // אזור רשימת Favorites / Watch Later

const modalMovieTitle = document.querySelector<HTMLHeadingElement>("#modalMovieTitle")!; // שם הסרט בחלון
const modalMovieDirector = document.querySelector<HTMLSpanElement>("#modalMovieDirector")!; // שם הבמאי
const modalMovieYear = document.querySelector<HTMLSpanElement>("#modalMovieYear")!; // שנת הסרט
const modalMovieDescription = document.querySelector<HTMLParagraphElement>("#modalMovieDescription")!; // תיאור הסרט
const modalMovieImage = document.querySelector<HTMLImageElement>("#modalMovieImage")!; // תמונת הסרט בחלון

const personalRatingDiv = document.querySelector<HTMLDivElement>("#personalRatingDiv")!; // אזור דירוג אישי
const globalRatingDiv = document.querySelector<HTMLDivElement>("#globalRatingDiv")!; // אזור דירוג ממוצע

const favoriteActionButton = document.querySelector<HTMLButtonElement>("#favoriteActionButton")!; // כפתור Favorites
const watchLaterActionButton = document.querySelector<HTMLButtonElement>("#watchLaterActionButton")!; // כפתור Watch Later
const deleteMovieButton = document.querySelector<HTMLButtonElement>("#deleteMovieButton")!; // כפתור מחיקת סרט

const favoritesButton = document.querySelector<HTMLButtonElement>("#favoritesButton")!; // כפתור Favorites העליון
const watchLaterButton = document.querySelector<HTMLButtonElement>("#watchLaterButton")!; // כפתור Watch Later העליון

const modalListTitle = document.querySelector<HTMLHeadingElement>("#modalListTitle")!; // כותרת רשימת הסרטים
const modalListContainer = document.querySelector<HTMLDivElement>("#modalListContainer")!; // אזור רשימת הסרטים בחלון

if (token == null) { // אם אין טוקן, המשתמש לא מחובר
    location.href = "loginsignup.html"; // מעבר לעמוד התחברות
}

floatingButton.onclick = function (): void { // כאשר לוחצים על כפתור הפלוס
    location.href = "add-movie.html"; // מעבר לעמוד הוספת סרט
};

async function loadUser(): Promise<void> { // פונקציה שטוענת את המשתמש המחובר

    const user = await send<any>("getUser", token); // בקשה לשרת לקבלת פרטי המשתמש

    if (user == null) { // אם לא התקבל משתמש תקין
        localStorage.removeItem("userToken"); // מוחקים את הטוקן
        location.href = "loginsignup.html"; // מחזירים לעמוד התחברות
        return; // עוצרים את המשך הפעולה
    }

    currentUser = user; // שמירת המשתמש במשתנה גלובלי

    const usernameSpan = document.getElementById("usernameSpan") as HTMLSpanElement; // מציאת המקום של שם המשתמש

    usernameSpan.innerText = user.name; // הצגת שם המשתמש באתר
}

async function loadMovies(): Promise<void> { // פונקציה שטוענת את כל הסרטים לעמוד הראשי

    const movies: Movie[] = await send<Movie[]>("getMovies", null); // קבלת כל הסרטים מהשרת

    moviesContainer.replaceChildren(); // ניקוי כל התוכן הקודם בלי להשתמש ב-innerHTML

    if (movies.length === 0) { // אם אין סרטים באתר
        const message = document.createElement("p"); // יצירת פסקה חדשה
        message.className = "empty-message"; // הוספת class לעיצוב
        message.innerText = "No movies yet. Click + to add your first movie."; // הכנסת טקסט
        moviesContainer.appendChild(message); // הוספת ההודעה לעמוד
        return; // יציאה מהפונקציה
    }

    movies.forEach(function (movie: Movie): void { // מעבר על כל הסרטים

        const card = document.createElement("div"); // יצירת כרטיס סרט
        card.className = "movie-card"; // הוספת class לעיצוב הכרטיס

        const image = document.createElement("img"); // יצירת תמונת סרט
        image.className = "movie-image"; // הוספת class לעיצוב התמונה
        image.src = movie.image; // הכנסת כתובת התמונה
        image.alt = movie.title; // טקסט חלופי לתמונה

        image.onclick = function (): void { // כאשר לוחצים על התמונה
            openMovieDetails(movie); // פתיחת חלון פרטי הסרט
        };

        card.appendChild(image); // הכנסת התמונה לתוך הכרטיס
        moviesContainer.appendChild(card); // הכנסת הכרטיס לעמוד
    });
}

function getMovieId(movie: Movie): number { // פונקציה שמחזירה id של סרט
    return (movie as any).id ?? (movie as any).Id; // תמיכה גם ב-id וגם ב-Id
}

function getMovieOwnerId(movie: Movie): number { // פונקציה שמחזירה id של מי שהוסיף את הסרט
    return (movie as any).userId ?? (movie as any).UserId; // תמיכה גם ב-userId וגם ב-UserId
}

function isMovieOwner(movie: Movie): boolean { // בדיקה האם המשתמש המחובר הוא בעל הסרט

    if (currentUser == null) { // אם אין משתמש מחובר
        return false; // הוא לא יכול להיות הבעלים
    }

    const currentUserId = currentUser.id ?? currentUser.Id; // שליפת id של המשתמש
    const movieOwnerId = getMovieOwnerId(movie); // שליפת id של בעל הסרט

    return currentUserId === movieOwnerId; // החזרת true אם זה אותו משתמש
}

async function openMovieDetails(movie: Movie): Promise<void> { // פתיחת חלון פרטי סרט

    const movieId = getMovieId(movie); // שליפת id של הסרט

    const isFavorite = await send<boolean>("isFavorite", token, movieId); // בדיקה האם הסרט במועדפים
    const isWatchLater = await send<boolean>("isWatchLater", token, movieId); // בדיקה האם הסרט ברשימת צפייה בהמשך
    const personalScore = await send<number | null>("getPersonalScore", token, movieId); // קבלת הדירוג האישי
    const globalScore = await send<number | null>("getGlobalScore", movieId); // קבלת הדירוג הממוצע

    movieListView.style.display = "none"; // הסתרת תצוגת רשימה
    movieDetailsView.style.display = "flex"; // הצגת תצוגת פרטי סרט

    modalMovieTitle.innerText = movie.title; // הכנסת שם הסרט
    modalMovieDirector.innerText = movie.director; // הכנסת שם הבמאי
    modalMovieYear.innerText = String(movie.year); // הכנסת השנה
    modalMovieDescription.innerText = movie.description; // הכנסת התיאור
    modalMovieImage.src = movie.image; // הכנסת תמונת הסרט
    modalMovieImage.alt = movie.title; // הכנסת טקסט חלופי לתמונה

    if (isMovieOwner(movie)) { // אם המשתמש הוא מי שהוסיף את הסרט
        deleteMovieButton.style.display = "block"; // מציגים כפתור מחיקה
    }
    else { // אם הסרט לא שייך למשתמש
        deleteMovieButton.style.display = "none"; // מסתירים כפתור מחיקה
    }

    updateFavoriteButton(favoriteActionButton, isFavorite); // עדכון טקסט ועיצוב כפתור מועדפים
    updateWatchLaterButton(watchLaterActionButton, isWatchLater); // עדכון טקסט ועיצוב כפתור צפייה בהמשך

    favoriteActionButton.onclick = async function (): Promise<void> { // פעולה בלחיצה על Favorites

        const currentlyFavorite = favoriteActionButton.classList.contains("selected-action"); // בדיקה האם כבר מסומן
        const newValue = !currentlyFavorite; // הפיכת המצב

        await send<boolean>("setFavorite", token, movieId, newValue); // שמירת המצב החדש בשרת

        updateFavoriteButton(favoriteActionButton, newValue); // עדכון הכפתור במסך
    };

    watchLaterActionButton.onclick = async function (): Promise<void> { // פעולה בלחיצה על Watch Later

        const currentlyWatchLater = watchLaterActionButton.classList.contains("selected-action"); // בדיקה האם כבר מסומן
        const newValue = !currentlyWatchLater; // הפיכת המצב

        await send<boolean>("setWatchLater", token, movieId, newValue); // שמירת המצב החדש בשרת

        updateWatchLaterButton(watchLaterActionButton, newValue); // עדכון הכפתור במסך
    };

    deleteMovieButton.onclick = async function (): Promise<void> { // פעולה בלחיצה על מחיקת סרט

        const confirmed = confirm("Are you sure you want to delete this movie?"); // שאלה למשתמש לפני מחיקה

        if (!confirmed) { // אם המשתמש ביטל
            return; // לא מוחקים
        }

        const success = await send<boolean>("deleteMovie", token, movieId); // בקשת מחיקה מהשרת

        if (success) { // אם המחיקה הצליחה
            closeMovieModal(); // סגירת החלון
            await loadMovies(); // טעינה מחדש של הסרטים
        }
        else { // אם המחיקה נכשלה
            alert("Movie was not deleted"); // הודעה למשתמש
        }
    };

    createPersonalStars(movieId, personalScore); // יצירת כוכבי הדירוג האישי
    createGlobalStars(globalScore); // יצירת כוכבי הדירוג הממוצע

    openMovieModal(); // פתיחת החלון
}

async function openFavoritesModal(): Promise<void> { // פתיחת חלון מועדפים

    const movies: Movie[] = await send<Movie[]>("getFavoriteMovies", token); // קבלת סרטים מועדפים מהשרת

    openMovieListModal("Favorites", movies); // הצגת הרשימה בחלון
}

async function openWatchLaterModal(): Promise<void> { // פתיחת חלון צפייה בהמשך

    const movies: Movie[] = await send<Movie[]>("getWatchLaterMovies", token); // קבלת סרטי Watch Later מהשרת

    openMovieListModal("Watch Later", movies); // הצגת הרשימה בחלון
}

function openMovieListModal(title: string, movies: Movie[]): void { // פתיחת רשימת סרטים בחלון

    movieDetailsView.style.display = "none"; // הסתרת תצוגת פרטי סרט
    movieListView.style.display = "block"; // הצגת תצוגת רשימה

    modalListTitle.innerText = title; // הכנסת כותרת הרשימה

    modalListContainer.replaceChildren(); // ניקוי הרשימה הקודמת בלי innerHTML

    if (movies.length === 0) { // אם אין סרטים ברשימה

        const message = document.createElement("p"); // יצירת הודעה
        message.className = "empty-message"; // הוספת class לעיצוב
        message.innerText = "No movies here yet."; // הכנסת טקסט

        modalListContainer.appendChild(message); // הוספת ההודעה לחלון
    }
    else { // אם יש סרטים ברשימה

        movies.forEach(function (movie: Movie): void { // מעבר על כל הסרטים

            const card = document.createElement("div"); // יצירת כרטיס קטן
            card.className = "modal-list-card"; // הוספת class לעיצוב

            const image = document.createElement("img"); // יצירת תמונה
            image.className = "modal-list-image"; // הוספת class
            image.src = movie.image; // הכנסת תמונה
            image.alt = movie.title; // הכנסת טקסט חלופי

            image.onclick = function (): void { // לחיצה על תמונה ברשימה
                openMovieDetails(movie); // פתיחת פרטי הסרט
            };

            const movieName = document.createElement("p"); // יצירת פסקה לשם הסרט
            movieName.innerText = movie.title; // הכנסת שם הסרט

            card.appendChild(image); // הוספת התמונה לכרטיס
            card.appendChild(movieName); // הוספת שם הסרט לכרטיס
            modalListContainer.appendChild(card); // הוספת הכרטיס לרשימה
        });
    }

    openMovieModal(); // פתיחת החלון
}

function updateFavoriteButton(button: HTMLButtonElement, isFavorite: boolean): void { // עדכון כפתור Favorites

    if (isFavorite) { // אם הסרט כבר במועדפים
        button.innerText = "Added to Favorites"; // שינוי הטקסט
        button.classList.add("selected-action"); // הוספת סימון עיצובי
    }
    else { // אם הסרט לא במועדפים
        button.innerText = "Add to Favorites"; // שינוי הטקסט
        button.classList.remove("selected-action"); // הסרת הסימון העיצובי
    }
}

function updateWatchLaterButton(button: HTMLButtonElement, isWatchLater: boolean): void { // עדכון כפתור Watch Later

    if (isWatchLater) { // אם הסרט כבר ברשימה
        button.innerText = "Added to Watch Later"; // שינוי הטקסט
        button.classList.add("selected-action"); // הוספת סימון עיצובי
    }
    else { // אם הסרט לא ברשימה
        button.innerText = "+ Watch Later"; // שינוי הטקסט
        button.classList.remove("selected-action"); // הסרת הסימון
    }
}

function createPersonalStars(movieId: number, personalScore: number | null): void { // יצירת כוכבי דירוג אישי

    personalRatingDiv.replaceChildren(); // ניקוי הכוכבים הקודמים

    const cancelButton = document.createElement("span"); // יצירת כפתור X למחיקת דירוג
    cancelButton.className = "remove-rating"; // הוספת class לעיצוב
    cancelButton.innerText = "×"; // הכנסת הסימן X

    cancelButton.onclick = async function (): Promise<void> { // לחיצה על X

        await send<boolean>("removeRating", token, movieId); // מחיקת הדירוג בשרת

        await openMovieDetailsById(movieId); // פתיחה מחדש של הסרט עם נתונים מעודכנים
    };

    personalRatingDiv.appendChild(cancelButton); // הוספת X לאזור הדירוג

    for (let i = 1; i <= 5; i++) { // יצירת 5 כוכבים

        const star = document.createElement("span"); // יצירת כוכב
        star.className = "star"; // הוספת class לעיצוב

        if (personalScore != null && personalScore >= i) { // אם המשתמש דירג עד הכוכב הזה
            star.innerText = "★"; // כוכב מלא
        }
        else { // אם המשתמש לא דירג עד הכוכב הזה
            star.innerText = "☆"; // כוכב ריק
        }

        star.onclick = async function (): Promise<void> { // לחיצה על כוכב

            await send<boolean>("setRating", token, movieId, i); // שמירת הדירוג בשרת

            await openMovieDetailsById(movieId); // פתיחה מחדש עם הדירוג המעודכן
        };

        personalRatingDiv.appendChild(star); // הוספת הכוכב למסך
    }
}

function createGlobalStars(globalScore: number | null): void { // יצירת כוכבי דירוג ממוצע

    globalRatingDiv.replaceChildren(); // ניקוי הדירוג הקודם

    if (globalScore == null) { // אם עדיין אין דירוגים

        const noRatingText = document.createElement("span"); // יצירת הודעת טקסט
        noRatingText.className = "rating-number"; // הוספת class
        noRatingText.innerText = "No ratings yet"; // הכנסת הודעה

        globalRatingDiv.appendChild(noRatingText); // הצגת ההודעה
        return; // יציאה מהפונקציה
    }

    const roundedScore = Math.round(globalScore * 2) / 2; // עיגול הדירוג לחצאי כוכבים

    for (let i = 1; i <= 5; i++) { // יצירת 5 כוכבים

        const star = document.createElement("span"); // יצירת כוכב
        star.className = "global-star"; // הוספת class לעיצוב

        if (roundedScore >= i) { // אם הדירוג מספיק לכוכב מלא
            star.innerText = "★"; // כוכב מלא
        }
        else if (roundedScore >= i - 0.5) { // אם הדירוג מספיק לחצי כוכב
            star.innerText = "⯨"; // חצי כוכב
        }
        else { // אם הדירוג לא מספיק
            star.innerText = "☆"; // כוכב ריק
        }

        globalRatingDiv.appendChild(star); // הוספת הכוכב למסך
    }

    const ratingNumber = document.createElement("span"); // יצירת טקסט מספרי של הדירוג
    ratingNumber.className = "rating-number"; // הוספת class
    ratingNumber.innerText = `${globalScore.toFixed(1)}/5`; // הצגת הדירוג במספר

    globalRatingDiv.appendChild(ratingNumber); // הוספת המספר למסך
}

async function openMovieDetailsById(movieId: number): Promise<void> { // פתיחת סרט מחדש לפי id

    const movies = await send<Movie[]>("getMovies", null); // קבלת כל הסרטים

    const movie = movies.find(function (movie: Movie): boolean { // חיפוש הסרט המתאים
        return getMovieId(movie) === movieId; // בדיקה לפי id
    });

    if (movie != null) { // אם הסרט נמצא
        await openMovieDetails(movie); // פתיחת פרטי הסרט
    }
}

function openMovieModal(): void { // פתיחת החלון הקופץ
    movieModal.style.display = "flex"; // הצגת החלון
}

function closeMovieModal(): void { // סגירת החלון הקופץ
    movieModal.style.display = "none"; // הסתרת החלון
    personalRatingDiv.replaceChildren(); // ניקוי דירוג אישי
    globalRatingDiv.replaceChildren(); // ניקוי דירוג ממוצע
    modalListContainer.replaceChildren(); // ניקוי רשימות
}

function logout(): void { // התנתקות מהאתר
    localStorage.removeItem("userToken"); // מחיקת הטוקן
    location.href = "loginsignup.html"; // מעבר לעמוד התחברות
}

window.onload = async (): Promise<void> => { // פעולה שמתרחשת כאשר העמוד נטען
    await loadUser(); // טעינת המשתמש
    await loadMovies(); // טעינת הסרטים
};

logoutButton.onclick = logout; // חיבור כפתור ההתנתקות לפונקציה
closeModalButton.onclick = closeMovieModal; // חיבור כפתור X לסגירת החלון
favoritesButton.onclick = openFavoritesModal; // חיבור כפתור Favorites העליון
watchLaterButton.onclick = openWatchLaterModal; // חיבור כפתור Watch Later העליון

movieModal.onclick = function (event: MouseEvent): void { // לחיצה על הרקע של החלון

    if (event.target === movieModal) { // אם הלחיצה הייתה על הרקע ולא על התוכן
        closeMovieModal(); // סגירת החלון
    }
};