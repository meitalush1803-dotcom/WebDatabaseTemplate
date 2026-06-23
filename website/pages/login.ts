// ייבוא פונקציית send שאחראית על שליחת בקשות לשרת
import { send } from "clientUtilities";


// שדה הזנת שם משתמש
const usernameInput =
    document.querySelector<HTMLInputElement>("#usernameInput")!;

// שדה הזנת סיסמה
const passwordInput =
    document.querySelector<HTMLInputElement>("#passwordInput")!;

// כפתור Login
const submitButton =
    document.querySelector<HTMLButtonElement>("#submitButton")!;

// אזור להצגת הודעות שגיאה
const errorDiv =
    document.querySelector<HTMLDivElement>("#errorDiv")!;


// כאשר המשתמש לוחץ על Login
submitButton.onclick = async function (): Promise<void> {

    // קבלת שם המשתמש מהשדה
    // trim מסיר רווחים מיותרים בתחילת ובסוף הטקסט
    const username =
        usernameInput.value.trim();

    // קבלת הסיסמה מהשדה
    const password =
        passwordInput.value;

    // ניקוי הודעת שגיאה קודמת
    errorDiv.innerText = "";


    // בדיקה שהמשתמש הזין שם משתמש
    if (!username) {

        errorDiv.innerText =
            "Please enter a username.";

        return;
    }

    // בדיקה שהמשתמש הזין סיסמה
    if (!password) {

        errorDiv.innerText =
            "Please enter a password.";

        return;
    }


    // שליחת בקשת התחברות לשרת
    // השרת יחזיר token אם ההתחברות הצליחה
    // או null אם שם המשתמש או הסיסמה שגויים
    const token =
        await send<string | null>(
            "logIn",
            username,
            password
        );


    // אם ההתחברות נכשלה
    if (token === null) {

        errorDiv.innerText =
            "Wrong username or password.";

        return;
    }


    // שמירת ה-token בזיכרון של הדפדפן
    // כך המשתמש יישאר מחובר גם לאחר רענון הדף
    localStorage.setItem(
        "userToken",
        token
    );


    // מעבר לעמוד הראשי לאחר התחברות מוצלחת
    location.href =
        "index.html";
};