// ייבוא פונקציית send שאחראית על שליחת בקשות לשרת
import { send } from "clientUtilities";


// שדה שם הסרט
const titleInput =
    document.getElementById("title") as HTMLInputElement;

// שדה שם הבמאי
const directorInput =
    document.getElementById("director") as HTMLInputElement;

// שדה שנת יציאת הסרט
const yearInput =
    document.getElementById("year") as HTMLInputElement;

// שדה קישור לתמונת הסרט
const imageInput =
    document.getElementById("image") as HTMLInputElement;

// שדה תיאור הסרט
const descriptionInput =
    document.getElementById("description") as HTMLTextAreaElement;

// אזור להצגת הודעות למשתמש
const message =
    document.getElementById("message") as HTMLParagraphElement;

// תמונת התצוגה המקדימה
const previewImage =
    document.getElementById("previewImage") as HTMLImageElement;


// בכל שינוי של קישור התמונה
imageInput.addEventListener("input", function (): void {

    // מעדכן את כתובת התמונה
    previewImage.src =
        imageInput.value;

    // מציג את התמונה על המסך
    previewImage.style.display =
        "block";
});


// פונקציה לשמירת סרט חדש
async function saveMovie(): Promise<void> {

    // ניקוי הודעה קודמת
    message.innerText = "";

    // קבלת הטוקן של המשתמש המחובר
    const token =
        localStorage.getItem("userToken");

    // אם אין טוקן המשתמש לא מחובר
    if (token == null) {

        message.innerText =
            "Please fill in all fields";

        return;
    }

    // קבלת שם הסרט
    const title =
        titleInput.value.trim();

    // קבלת שם הבמאי
    const director =
        directorInput.value.trim();

    // קבלת השנה כטקסט
    const yearText =
        yearInput.value.trim();

    // קבלת קישור התמונה
    const image =
        imageInput.value.trim();

    // קבלת תיאור הסרט
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

        message.innerText =
            "Please fill in all fields";

        return;
    }

    // המרת השנה ממחרוזת למספר
    const year =
        Number(yearText);

    // בדיקה שהשנה היא מספר תקין
    if (Number.isNaN(year)) {

        message.innerText =
            "Please enter a valid year";

        return;
    }

    // שליחת הסרט החדש לשרת
    // הסדר חייב להיות זהה לסדר שהשרת מצפה לקבל
    const success =
        await send<boolean>(
            "addMovie",
            token,
            title,
            director,
            year,
            image,
            description
        );

    // אם השמירה הצליחה
    if (success) {

        // מעבר לעמוד הראשי
        location.href =
            "index.html";
    }
}


// חזרה לעמוד הראשי ללא שמירת הסרט
function goBack(): void {

    location.href =
        "index.html";
}


// מאפשר ל-HTML להפעיל את saveMovie()
(window as any).saveMovie =
    saveMovie;

// מאפשר ל-HTML להפעיל את goBack()
(window as any).goBack =
    goBack;