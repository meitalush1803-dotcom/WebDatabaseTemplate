// לוקחים את הכפתור
const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;

// מאזינים ללחיצה
loginBtn.addEventListener("click", () => {

    // לוקחים את מה שהמשתמש כתב
    const username = (document.getElementById("username") as HTMLInputElement).value;

    const password = (document.getElementById("password") as HTMLInputElement).value;

    // מביאים את הנתונים מה-LocalStorage
    const savedUser = localStorage.getItem("user");

    const savedPass = localStorage.getItem("pass");

    // בודקים אם הנתונים נכונים
    if (username === savedUser && password === savedPass) {

        // הודעת הצלחה
        alert("Login successful 💖");

        // מעבר לעמוד הבית
        window.location.href = "home.html";

    } else {

        // הודעת שגיאה
        const message = document.getElementById("message") as HTMLParagraphElement;

        message.textContent = "Wrong username or password ❌";
    }
});