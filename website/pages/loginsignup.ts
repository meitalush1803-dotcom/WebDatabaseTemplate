// לוקחים את כפתור ה-Login מה-HTML לפי ה-id שלו
const loginButton = document.getElementById("loginBtn") as HTMLButtonElement;

// לוקחים את כפתור ה-Sign Up
const signupButton = document.getElementById("signupBtn") as HTMLButtonElement;


// מוסיפים מאזין ללחיצה על כפתור Login
loginButton.addEventListener("click", () => {
    console.log("Login clicked"); // לבדיקה שהקוד עובד

    // מעבר לעמוד login.html
    window.location.href = "login.html";
});


// מוסיפים מאזין ללחיצה על כפתור Sign Up
signupButton.addEventListener("click", () => {
    console.log("Sign Up clicked"); // לבדיקה

    // מעבר לעמוד signup.html
    window.location.href = "signup.html";
});

