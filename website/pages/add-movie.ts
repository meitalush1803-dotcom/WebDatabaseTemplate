import { send } from "clientUtilities";

// קבלת שדה שם הסרט מה-HTML
const titleInput =
    document.getElementById("title") as HTMLInputElement;

// קבלת שדה שם הבמאי מה-HTML
const directorInput =
    document.getElementById("director") as HTMLInputElement;

// קבלת שדה שנת יציאת הסרט מה-HTML
const yearInput =
    document.getElementById("year") as HTMLInputElement;

// קבלת שדה קישור התמונה מה-HTML
const imageInput =
    document.getElementById("image") as HTMLInputElement;

// קבלת שדה תיאור הסרט מה-HTML
const descriptionInput =
    document.getElementById("description") as HTMLTextAreaElement;

// קבלת אלמנט התצוגה המקדימה של התמונה
const previewImage =
    document.getElementById("previewImage") as HTMLImageElement;

// בכל פעם שמקלידים קישור לתמונה — מציגים תצוגה מקדימה
imageInput.addEventListener("input", function (): void {

    previewImage.src = imageInput.value;

    previewImage.style.display = "block";
});

// פונקציה ששומרת סרט חדש במסד הנתונים
async function saveMovie(): Promise<void> {

    // קבלת הטוקן של המשתמש המחובר
    const token =
        localStorage.getItem("userToken");

    // אם אין טוקן — המשתמש לא מחובר ולכן אי אפשר להוסיף סרט
    if (token == null) {

        alert("User is not logged in");

        return;
    }

    // לקיחת הערכים שהמשתמש הקליד בטופס
    const title =
        titleInput.value.trim();

    const director =
        directorInput.value.trim();

    const yearText =
        yearInput.value.trim();

    const image =
        imageInput.value.trim();

    const description =
        descriptionInput.value.trim();

    // בדיקה שכל השדות מולאו
    if (
        title === "" ||
        director === "" ||
        yearText === "" ||
        image === "" ||
        description === ""
    ) {

        alert("Please fill in all fields");

        return;
    }

    // המרת השנה מטקסט למספר
    const year =
        Number(yearText);

    // בדיקה שהשנה היא באמת מספר
    if (Number.isNaN(year)) {

        alert("Please enter a valid year");

        return;
    }

    // שליחת פרטי הסרט לשרת
    // הסדר חייב להיות זהה למה שהשרת מצפה לקבל ב-Program.cs
    const success = await send<boolean>(
        "addMovie",
        token,
        title,
        director,
        year,
        image,
        description
    );

    // אם הסרט נשמר בהצלחה — חוזרים לעמוד הראשי
    if (success) {

        location.href = "index.html";
    }
}

// פונקציה שחוזרת לעמוד הראשי בלי לשמור סרט
function goBack(): void {

    location.href = "index.html";
}

// מאפשר לכפתורי ה-HTML להשתמש בפונקציות saveMovie ו-goBack
(window as any).saveMovie = saveMovie;
(window as any).goBack = goBack;