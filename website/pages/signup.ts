import { send } from "clientUtilities";


// 1. מציאת כל האלמנטים מה-HTML לפי ה-IDs המדויקים שלך
const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const confirmInput = document.querySelector<HTMLInputElement>("#confirmInput")!;
const submitButton = document.querySelector<HTMLButtonElement>("#submitButton")!;
const errorDiv = document.querySelector<HTMLDivElement>("#errorDiv")!;

// 2. האזנה ללחיצה על כפתור Create Account
submitButton.onclick = async function() {
    // איפוס הודעת השגיאה הקודמת
    errorDiv.innerText = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    // א. בדיקה שכל השדות מלאים
    if (username == "" || password == "" || confirmPassword == "") {
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    // ב. בדיקת התאמה בין הסיסמאות
    if (password != confirmPassword) {
        errorDiv.innerText = "Passwords do not match!";
        return;
    }

      const token = await send<string | null>("signUp", username, password);

        // ד. בדיקת התשובה מה-Database
        if (token == null) {
            // השרת החזיר null כי השם כבר תפוס ב-Database
            errorDiv.innerText = "Username is already taken!";
            return;
        } else {
            // שמירת הטוקן בזיכרון של הדפדפן
            localStorage.setItem("userToken", token);
            
            // מעבר אוטומטי לעמוד הראשי
            location.href = "index.html";
        }
      }