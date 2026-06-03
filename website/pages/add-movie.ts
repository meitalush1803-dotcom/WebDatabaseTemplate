import { send } from "clientUtilities";

// קבלת שדה שם הסרט מה-HTML
const titleInput =
    document.getElementById("title") as HTMLInputElement;

// קבלת שדה שם הבמאי מה-HTML
const directorInput =
    document.getElementById("director") as HTMLInputElement;

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

    // לקיחת הערכים שהמשתמש הקליד בטופס
    const title = titleInput.value;
    const director = directorInput.value;
    const image = imageInput.value;
    const description = descriptionInput.value;

    // בדיקה שכל השדות מולאו
    if (title === "" || director === "" || image === "" || description === "") {

        alert("Please fill in all fields");

        return;
    }

    // שליחת פרטי הסרט לשרת
    // חשוב: שולחים פרמטרים רגילים, לא מערך
    const success = await send<boolean>(
        "addMovie",
        title,
        director,
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

// מאפשר לכפתורים שנמצאים ב-HTML להשתמש בפונקציות האלה
(window as any).saveMovie = saveMovie;
(window as any).goBack = goBack;