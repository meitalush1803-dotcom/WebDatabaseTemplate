using System;
using System.Linq;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Project.DatabaseUtilities;
using Project.LoggingUtilities;
using Project.ServerUtilities;

class Program
{
    static void Main()
    {
        // מספר הפורט שעליו השרת ירוץ
        int port = 5000;

        // יצירת שרת
        var server = new Server(port);

        // יצירת חיבור למסד הנתונים
        var database = new Database();

        Console.WriteLine("The server is running");
        Console.WriteLine($"Local:    http://localhost:{port}/website/pages/loginsignup.html");
        Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/loginsignup.html");


// לולאה אינסופית שרצה כל הזמן ומחכה לבקשות מהלקוחות
while (true)
{
    // קבלת הבקשה הבאה שהגיעה לשרת
    var request =
        server.WaitForRequest();

    // הדפסת שם הבקשה למסך לצורך בדיקה ומעקב
    Console.WriteLine(
        $"Received a request: {request.Name}"
    );

    try
    {
        // הרשמת משתמש חדש
        if (request.Name == "signUp")
        {
            SignUp(request, database);
        }

        // התחברות משתמש קיים
        else if (request.Name == "logIn")
        {
            LogIn(request, database);
        }

        // קבלת פרטי המשתמש לפי token
        else if (request.Name == "getUser")
        {
            GetUser(request, database);
        }

        // הוספת סרט חדש למסד הנתונים
        else if (request.Name == "addMovie")
        {
            AddMovie(request, database);
        }

        // קבלת כל הסרטים הקיימים באתר
        else if (request.Name == "getMovies")
        {
            GetMovies(request, database);
        }

        // מחיקת סרט מהאתר
        else if (request.Name == "deleteMovie")
        {
            DeleteMovie(request, database);
        }

        // הוספה או הסרה של סרט מהמועדפים
        else if (request.Name == "setFavorite")
        {
            SetFavorite(request, database);
        }

        // בדיקה האם סרט נמצא במועדפים של המשתמש
        else if (request.Name == "isFavorite")
        {
            IsFavorite(request, database);
        }

        // קבלת כל סרטי המועדפים של המשתמש
        else if (request.Name == "getFavoriteMovies")
        {
            GetFavoriteMovies(request, database);
        }

        // הוספה או הסרה של סרט מרשימת צפייה בהמשך
        else if (request.Name == "setWatchLater")
        {
            SetWatchLater(request, database);
        }

        // בדיקה האם סרט נמצא ברשימת צפייה בהמשך
        else if (request.Name == "isWatchLater")
        {
            IsWatchLater(request, database);
        }

        // קבלת כל הסרטים שסומנו לצפייה בהמשך
        else if (request.Name == "getWatchLaterMovies")
        {
            GetWatchLaterMovies(request, database);
        }

        // שמירת דירוג אישי של משתמש לסרט
        else if (request.Name == "setRating")
        {
            SetRating(request, database);
        }

        // מחיקת דירוג אישי של משתמש
        else if (request.Name == "removeRating")
        {
            RemoveRating(request, database);
        }

        // קבלת הדירוג האישי של המשתמש לסרט
        else if (request.Name == "getPersonalScore")
        {
            GetPersonalScore(request, database);
        }

        // קבלת הדירוג הממוצע של כל המשתמשים לסרט
        else if (request.Name == "getGlobalScore")
        {
            GetGlobalScore(request, database);
        }

        // אם התקבלה בקשה שהשרת לא מכיר
        else
        {
            // מחזיר שגיאה 400 - בקשה לא תקינה
            request.SetStatusCode(400);
        }
    }

    // טיפול בשגיאות שעלולות לקרות בזמן הרצת השרת
    catch (Exception exception)
    {
        // מחזיר שגיאת שרת
        request.SetStatusCode(500);

        // שומר את פרטי השגיאה ללוג
        Log.WriteException(exception);
    }
}

// הרשמת משתמש חדש
static void SignUp(Request request, Database database)
{
    // קבלת שם משתמש וסיסמה שנשלחו מהלקוח
    var (username, password) =
        request.GetParams<(string, string)>();

    // בדיקה האם כבר קיים משתמש עם אותו שם
    bool usernameAlreadyExists =
        database.Users.Any(user => user.Name == username);

    // אם שם המשתמש כבר קיים
    if (usernameAlreadyExists)
    {
        // מחזירים null כדי שהלקוח ידע שההרשמה נכשלה
        request.Respond<string?>(null);

        // יציאה מהפונקציה
        return;
    }

    // יצירת token ייחודי למשתמש החדש
    string token =
        Guid.NewGuid().ToString();

    // יצירת אובייקט משתמש חדש
    var newUser =
        new User(token, username, password);

    // הוספת המשתמש החדש לטבלת המשתמשים
    database.Users.Add(newUser);

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת ה-token ללקוח כדי שהמשתמש ייחשב מחובר
    request.Respond(token);
}

// התחברות משתמש קיים
static void LogIn(Request request, Database database)
{
    // קבלת שם משתמש וסיסמה שנשלחו מהלקוח
    var (username, password) =
        request.GetParams<(string, string)>();

    // חיפוש משתמש עם שם וסיסמה מתאימים
    var user =
        database.Users.FirstOrDefault(user =>
            user.Name == username &&
            user.Password == password
        );

    // אם לא נמצא משתמש מתאים
    if (user == null)
    {
        // מחזירים null כדי שהלקוח ידע שההתחברות נכשלה
        request.Respond<string?>(null);

        // יציאה מהפונקציה
        return;
    }

    // אם המשתמש נמצא, מחזירים את ה-token שלו
    request.Respond(user.Token);
}

// קבלת משתמש לפי token
static void GetUser(Request request, Database database)
{
    // קבלת ה-token שנשלח מהלקוח
    string? token =
        request.GetParams<string?>();

    // אם לא התקבל token
    if (token == null)
    {
        // מחזירים null כי אין משתמש מחובר
        request.Respond<User?>(null);

        // יציאה מהפונקציה
        return;
    }

    // חיפוש המשתמש לפי ה-token
    var user =
        database.Users.FirstOrDefault(user => user.Token == token);

    // החזרת המשתמש שנמצא, או null אם לא נמצא
    request.Respond(user);
}

// הוספת סרט חדש למסד הנתונים
static void AddMovie(Request request, Database database)
{
    // קבלת כל פרטי הסרט וה-token מהלקוח
    var (token, title, director, year, image, description) =
        request.GetParams<(string, string, string, int, string, string)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים false כי אי אפשר להוסיף סרט בלי משתמש מחובר
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // יצירת אובייקט סרט חדש
    var movie =
        new Movie(title, director, year, image, description, user.Id);

    // הוספת הסרט לטבלת הסרטים
    database.Movies.Add(movie);

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת true כדי לסמן שהסרט נוסף בהצלחה
    request.Respond(true);
}

// קבלת כל הסרטים
static void GetMovies(Request request, Database database)
{
    // שליפת כל הסרטים מטבלת הסרטים
    var movies =
        database.Movies.ToList();

    // החזרת רשימת הסרטים ללקוח
    request.Respond(movies);
}

// מחיקת סרט מהמסד
static void DeleteMovie(Request request, Database database)
{
    // קבלת token ומזהה הסרט מהלקוח
    var (token, movieId) =
        request.GetParams<(string, int)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים false כי משתמש לא מחובר לא יכול למחוק
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // חיפוש הסרט לפי המזהה שלו
    var movie =
        database.Movies.FirstOrDefault(movie => movie.Id == movieId);

    // אם הסרט לא נמצא
    if (movie == null)
    {
        // מחזירים false כי אין מה למחוק
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה שרק המשתמש שהוסיף את הסרט יכול למחוק אותו
    if (movie.UserId != user.Id)
    {
        // מחזירים false כי המשתמש לא בעל הסרט
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // מחיקת כל רשומות המועדפים שקשורות לסרט
    database.FavoriteMovies.RemoveRange(
        database.FavoriteMovies.Where(favorite => favorite.MovieId == movieId)
    );

    // מחיקת כל רשומות הצפייה בהמשך שקשורות לסרט
    database.WatchLaterMovies.RemoveRange(
        database.WatchLaterMovies.Where(item => item.MovieId == movieId)
    );

    // מחיקת כל הדירוגים שקשורים לסרט
    database.MovieRatings.RemoveRange(
        database.MovieRatings.Where(rating => rating.MovieId == movieId)
    );

    // מחיקת הסרט עצמו מטבלת הסרטים
    database.Movies.Remove(movie);

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת true כי המחיקה הצליחה
    request.Respond(true);
}

// פונקציית עזר למציאת משתמש לפי token
static User? GetUserByToken(Database database, string? token)
{
    // אם לא התקבל token
    if (token == null)
    {
        // אין משתמש מחובר
        return null;
    }

    // חיפוש והחזרת המשתמש שה-token שלו מתאים
    return database.Users.FirstOrDefault(user => user.Token == token);
}

// הוספה או הסרה של סרט מהמועדפים
static void SetFavorite(Request request, Database database)
{
    // קבלת token, מזהה סרט והאם להוסיף או להסיר
    var (token, movieId, toAdd) =
        request.GetParams<(string, int, bool)>();

    // חיפוש המשתמש המחובר לפי token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // הפעולה נכשלה
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה האם כבר קיימת רשומת מועדפים לסרט הזה אצל המשתמש
    var favorite =
        database.FavoriteMovies.FirstOrDefault(favorite =>
            favorite.UserId == user.Id &&
            favorite.MovieId == movieId
        );

    // אם צריך להוסיף למועדפים
    if (toAdd)
    {
        // מוסיפים רק אם הסרט עדיין לא נמצא במועדפים
        if (favorite == null)
        {
            // יצירת רשומת מועדפים חדשה
            database.FavoriteMovies.Add(
                new FavoriteMovie(user.Id, movieId)
            );
        }
    }

    // אם צריך להסיר מהמועדפים
    else
    {
        // מסירים רק אם הסרט באמת נמצא במועדפים
        if (favorite != null)
        {
            // הסרת רשומת המועדפים
            database.FavoriteMovies.Remove(favorite);
        }
    }

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת true כי הפעולה הסתיימה בהצלחה
    request.Respond(true);
}

// בדיקה האם סרט נמצא במועדפים
static void IsFavorite(Request request, Database database)
{
    // קבלת token ומזהה סרט מהלקוח
    var (token, movieId) =
        request.GetParams<(string, int)>();

    // חיפוש המשתמש המחובר לפי token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים false כי אין משתמש מחובר
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה האם קיימת רשומת מועדפים למשתמש ולסרט
    bool exists =
        database.FavoriteMovies.Any(favorite =>
            favorite.UserId == user.Id &&
            favorite.MovieId == movieId
        );

    // החזרת true אם הסרט במועדפים, אחרת false
    request.Respond(exists);
}

// קבלת כל סרטי המועדפים של המשתמש
static void GetFavoriteMovies(Request request, Database database)
{
    // קבלת ה-token שנשלח מהלקוח
    string token =
        request.GetParams<string>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים רשימה ריקה במקום שגיאה
        request.Respond(Array.Empty<Movie>());

        // יציאה מהפונקציה
        return;
    }

    // שליפת כל הסרטים שנמצאים במועדפים של המשתמש
    var movies =
        database.FavoriteMovies

            // מסנן רק את הרשומות ששייכות למשתמש המחובר
            .Where(favorite => favorite.UserId == user.Id)

            // מתוך כל רשומת FavoriteMovie לוקחים את הסרט עצמו
            .Select(favorite => favorite.Movie)

            // הופך את התוצאה לרשימה
            .ToList();

    // החזרת רשימת הסרטים ללקוח
    request.Respond(movies);
}

// הוספה או הסרה של סרט מצפייה בהמשך
static void SetWatchLater(Request request, Database database)
{
    // קבלת token, מזהה סרט והאם להוסיף או להסיר
    var (token, movieId, toAdd) =
        request.GetParams<(string, int, bool)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // הפעולה נכשלה
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה האם הסרט כבר נמצא ברשימת צפייה בהמשך של המשתמש
    var watchLater =
        database.WatchLaterMovies.FirstOrDefault(item =>
            item.UserId == user.Id &&
            item.MovieId == movieId
        );

    // אם צריך להוסיף לרשימת צפייה בהמשך
    if (toAdd)
    {
        // מוסיפים רק אם הסרט עדיין לא נמצא ברשימה
        if (watchLater == null)
        {
            // יצירת רשומה חדשה בטבלת WatchLaterMovies
            database.WatchLaterMovies.Add(
                new WatchLaterMovie(user.Id, movieId)
            );
        }
    }

    // אם צריך להסיר מרשימת צפייה בהמשך
    else
    {
        // מסירים רק אם הסרט באמת נמצא ברשימה
        if (watchLater != null)
        {
            // הסרת הרשומה מהטבלה
            database.WatchLaterMovies.Remove(watchLater);
        }
    }

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת true כי הפעולה הסתיימה בהצלחה
    request.Respond(true);
}

// בדיקה האם סרט נמצא בצפייה בהמשך
static void IsWatchLater(Request request, Database database)
{
    // קבלת token ומזהה סרט מהלקוח
    var (token, movieId) =
        request.GetParams<(string, int)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים false כי אין משתמש מחובר
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה האם קיימת רשומת WatchLater למשתמש ולסרט
    bool exists =
        database.WatchLaterMovies.Any(item =>
            item.UserId == user.Id &&
            item.MovieId == movieId
        );

    // החזרת true אם הסרט נמצא בצפייה בהמשך, אחרת false
    request.Respond(exists);
}

// קבלת כל הסרטים שהמשתמש סימן לצפייה בהמשך
static void GetWatchLaterMovies(Request request, Database database)
{
    // קבלת ה-token שנשלח מהלקוח
    string token =
        request.GetParams<string>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים רשימה ריקה במקום שגיאה
        request.Respond(Array.Empty<Movie>());

        // יציאה מהפונקציה
        return;
    }

    // שליפת כל הסרטים שנמצאים ברשימת צפייה בהמשך של המשתמש
    var movies =
        database.WatchLaterMovies

            // מסנן רק רשומות ששייכות למשתמש המחובר
            .Where(item => item.UserId == user.Id)

            // מתוך כל רשומת WatchLaterMovie לוקחים את הסרט עצמו
            .Select(item => item.Movie)

            // הופך את התוצאה לרשימה
            .ToList();

    // החזרת רשימת הסרטים ללקוח
    request.Respond(movies);
}

// שמירת דירוג אישי לסרט
static void SetRating(Request request, Database database)
{
    // קבלת token, מזהה סרט וציון מהלקוח
    var (token, movieId, score) =
        request.GetParams<(string, int, int)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // הפעולה נכשלה
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // בדיקה האם המשתמש כבר דירג את הסרט הזה
    var rating =
        database.MovieRatings.FirstOrDefault(rating =>
            rating.UserId == user.Id &&
            rating.MovieId == movieId
        );

    // אם אין דירוג קודם
    if (rating == null)
    {
        // יצירת דירוג חדש
        database.MovieRatings.Add(
            new MovieRating(score, user.Id, movieId)
        );
    }

    // אם כבר קיים דירוג
    else
    {
        // עדכון הציון הקיים
        rating.Score = score;
    }

    // שמירת השינויים במסד הנתונים
    database.SaveChanges();

    // החזרת true כי הדירוג נשמר
    request.Respond(true);
}

// מחיקת דירוג אישי
static void RemoveRating(Request request, Database database)
{
    // קבלת token ומזהה סרט מהלקוח
    var (token, movieId) =
        request.GetParams<(string, int)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // הפעולה נכשלה
        request.Respond(false);

        // יציאה מהפונקציה
        return;
    }

    // חיפוש הדירוג של המשתמש לסרט
    var rating =
        database.MovieRatings.FirstOrDefault(rating =>
            rating.UserId == user.Id &&
            rating.MovieId == movieId
        );

    // אם נמצא דירוג
    if (rating != null)
    {
        // מחיקת הדירוג מהטבלה
        database.MovieRatings.Remove(rating);

        // שמירת המחיקה במסד הנתונים
        database.SaveChanges();
    }

    // החזרת true כי הפעולה הסתיימה
    request.Respond(true);
}

// קבלת הדירוג האישי של המשתמש לסרט
static void GetPersonalScore(Request request, Database database)
{
    // קבלת token ומזהה סרט מהלקוח
    var (token, movieId) =
        request.GetParams<(string, int)>();

    // חיפוש המשתמש המחובר לפי ה-token
    var user =
        GetUserByToken(database, token);

    // אם המשתמש לא נמצא
    if (user == null)
    {
        // מחזירים null כי אין דירוג אישי
        request.Respond<int?>(null);

        // יציאה מהפונקציה
        return;
    }

    // חיפוש הדירוג של המשתמש לסרט
    var rating =
        database.MovieRatings.FirstOrDefault(rating =>
            rating.UserId == user.Id &&
            rating.MovieId == movieId
        );

    // החזרת הציון אם קיים, ואם לא קיים מוחזר null
    request.Respond(rating?.Score);
}

// קבלת דירוג ממוצע של הסרט מכל המשתמשים
static void GetGlobalScore(Request request, Database database)
{
    // קבלת מזהה הסרט מהלקוח
    int movieId =
        request.GetParams<int>();

    // שליפת כל הדירוגים של הסרט
    var ratings =
        database.MovieRatings.Where(rating => rating.MovieId == movieId);

    // אם עדיין אין דירוגים לסרט
    if (!ratings.Any())
    {
        // מחזירים null כי אין ממוצע
        request.Respond<double?>(null);

        // יציאה מהפונקציה
        return;
    }

    // חישוב ממוצע הדירוגים של הסרט
    double average =
        ratings.Average(rating => rating.Score);

    // החזרת הדירוג הממוצע ללקוח
    request.Respond(average);
}
}

// הגדרת טבלאות במסד הנתונים של האתר
class Database() : DatabaseCore("database")
{
    // טבלת המשתמשים
    public DbSet<User> Users { get; set; } = default!;

    // טבלת הסרטים
    public DbSet<Movie> Movies { get; set; } = default!;

    // טבלת הסרטים המועדפים
    public DbSet<FavoriteMovie> FavoriteMovies { get; set; } = default!;

    // טבלת הסרטים לצפייה בהמשך
    public DbSet<WatchLaterMovie> WatchLaterMovies { get; set; } = default!;

    // טבלת הדירוגים
    public DbSet<MovieRating> MovieRatings { get; set; } = default!;
}


// מודל של משתמש
class User(string token, string name, string password)
{
    // מזהה ייחודי של המשתמש במסד הנתונים
    public int Id { get; set; } = default!;

    // token אישי של המשתמש
    // JsonIgnore מונע שליחה שלו ללקוח כחלק מפרטי המשתמש
    [JsonIgnore]
    public string Token { get; set; } = token;

    // שם המשתמש
    public string Name { get; set; } = name;

    // סיסמת המשתמש
    // JsonIgnore מונע שליחת הסיסמה ללקוח
    [JsonIgnore]
    public string Password { get; set; } = password;
}


// מודל של סרט
class Movie(string title, string director, int year, string image, string description, int userId)
{
    // מזהה ייחודי של הסרט במסד הנתונים
    public int Id { get; set; } = default!;

    // שם הסרט
    public string Title { get; set; } = title;

    // שם הבמאי
    public string Director { get; set; } = director;

    // שנת יציאת הסרט
    public int Year { get; set; } = year;

    // קישור לתמונת הסרט
    public string Image { get; set; } = image;

    // תיאור הסרט
    public string Description { get; set; } = description;

    // מזהה המשתמש שהוסיף את הסרט
    public int UserId { get; set; } = userId;

    // קשר לאובייקט המשתמש שהוסיף את הסרט
    public User User { get; set; } = default!;
}


// טבלה שמחברת בין משתמש לבין סרט שהוא סימן כמועדף
class FavoriteMovie(int userId, int movieId)
{
    // מזהה ייחודי של רשומת המועדפים
    public int Id { get; set; } = default!;

    // מזהה המשתמש שסימן את הסרט כמועדף
    public int UserId { get; set; } = userId;

    // מזהה הסרט שסומן כמועדף
    public int MovieId { get; set; } = movieId;

    // קשר לאובייקט המשתמש
    public User User { get; set; } = default!;

    // קשר לאובייקט הסרט
    public Movie Movie { get; set; } = default!;
}


// טבלה שמחברת בין משתמש לבין סרט שהוא סימן לצפייה בהמשך
class WatchLaterMovie(int userId, int movieId)
{
    // מזהה ייחודי של רשומת הצפייה בהמשך
    public int Id { get; set; } = default!;

    // מזהה המשתמש שסימן את הסרט לצפייה בהמשך
    public int UserId { get; set; } = userId;

    // מזהה הסרט שסומן לצפייה בהמשך
    public int MovieId { get; set; } = movieId;

    // קשר לאובייקט המשתמש
    public User User { get; set; } = default!;

    // קשר לאובייקט הסרט
    public Movie Movie { get; set; } = default!;
}


// טבלה ששומרת דירוג של משתמש לסרט מסוים
class MovieRating(int score, int userId, int movieId)
{
    // מזהה ייחודי של רשומת הדירוג
    public int Id { get; set; } = default!;

    // הציון שהמשתמש נתן לסרט
    public int Score { get; set; } = score;

    // מזהה המשתמש שנתן את הדירוג
    public int UserId { get; set; } = userId;

    // מזהה הסרט שקיבל את הדירוג
    public int MovieId { get; set; } = movieId;

    // קשר לאובייקט המשתמש
    public User User { get; set; } = default!;

    // קשר לאובייקט הסרט
    public Movie Movie { get; set; } = default!;
}
}