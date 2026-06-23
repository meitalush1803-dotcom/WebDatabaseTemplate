// ייבוא פונקציית send שאחראית על שליחת בקשות לשרת
import { send } from "clientUtilities";


// קבלת אלמנטים מה-HTML

// שדה שם המשתמש
const usernameInput =
    document.querySelector<HTMLInputElement>("#usernameInput")!;

// שדה הסיסמה
const passwordInput =
    document.querySelector<HTMLInputElement>("#passwordInput")!;

// שדה אימות סיסמה
const confirmInput =
    document.querySelector<HTMLInputElement>("#confirmInput")!;

// כפתור יצירת החשבון
const submitButton =
    document.querySelector<HTMLButtonElement>("#submitButton")!;

// אזור להצגת הודעות שגיאה למשתמש
const errorDiv =
    document.querySelector<HTMLDivElement>("#errorDiv")!;


// לחיצה על Create Account

// כאשר המשתמש לוחץ על כפתור ההרשמה
submitButton.onclick = async function (): Promise<void> {

    // ניקוי הודעת שגיאה קודמת
    errorDiv.innerText = "";

    // קבלת שם המשתמש מהשדה
    // trim מסיר רווחים מיותרים בתחילת ובסוף הטקסט
    const username =
        usernameInput.value.trim();

    // קבלת הסיסמה
    const password =
        passwordInput.value;

    // קבלת הסיסמה החוזרת
    const confirmPassword =
        confirmInput.value;

    // בדיקות תקינות

    // בדיקה שכל השדות מולאו
    if (
        username == "" ||
        password == "" ||
        confirmPassword == ""
    ) {

        // הצגת הודעת שגיאה
        errorDiv.innerText =
            "Please fill in all fields.";

        return;
    }

    // בדיקה שהסיסמה והאימות זהים
    if (password != confirmPassword) {

        // הצגת הודעת שגיאה
        errorDiv.innerText =
            "Passwords do not match!";

        return;
    }

    // שליחת בקשת הרשמה לשרת

    // השרת יוצר משתמש חדש ומחזיר token
    // אם השם כבר תפוס השרת יחזיר null
    const token =
        await send<string | null>(
            "signUp",
            username,
            password
        );

    // בדיקת תשובת השרת

    // אם התקבל null
    if (token == null) {

        // שם המשתמש כבר קיים במערכת
        errorDiv.innerText =
            "Username is already taken!";

        return;
    }

    // התחברות אוטומטית
    
    // שמירת ה-token בדפדפן
    // כך המשתמש נשאר מחובר גם אחרי רענון הדף
    localStorage.setItem(
        "userToken",
        token
    );

    // מעבר אוטומטי לעמוד הראשי
    location.href =
        "index.html";
};