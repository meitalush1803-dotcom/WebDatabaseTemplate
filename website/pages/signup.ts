// לוקחים את הכפתור
const signupBtn = document.getElementById("signupBtn") as HTMLButtonElement;

// מאזינים ללחיצה
signupBtn.addEventListener("click", () => {

    // לוקחים את הערכים מהשדות
    const username = (document.getElementById("username") as HTMLInputElement).value;

    const password = (document.getElementById("password") as HTMLInputElement).value;

    // בודקים שלא ריק
    if (!username || !password) {

        alert("Please fill all fields");

        return;
    }

    // שומרים ב-LocalStorage
    localStorage.setItem("user", username);

    localStorage.setItem("pass", password);

    // הודעה
    alert("Account created successfully 💖");

    // מעבר ל-login
    window.location.href = "login.html";
});