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

        // לולאה אינסופית שמחכה לבקשות מהלקוח
        while (true)
        {
            var request = server.WaitForRequest();

            Console.WriteLine($"Received a request: {request.Name}");

            try
            {
                // הרשמה
                if (request.Name == "signUp")
                {
                    SignUp(request, database);
                }

                // התחברות
                else if (request.Name == "logIn")
                {
                    LogIn(request, database);
                }

                // קבלת פרטי משתמש
                else if (request.Name == "getUser")
                {
                    GetUser(request, database);
                }

                // הוספת סרט
                else if (request.Name == "addMovie")
                {
                    AddMovie(request, database);
                }

                // קבלת כל הסרטים
                else if (request.Name == "getMovies")
                {
                    GetMovies(request, database);
                }

                // מחיקת סרט
                else if (request.Name == "deleteMovie")
                {
                    DeleteMovie(request, database);
                }

                // הוספה או הסרה ממועדפים
                else if (request.Name == "setFavorite")
                {
                    SetFavorite(request, database);
                }

                // בדיקה האם סרט נמצא במועדפים
                else if (request.Name == "isFavorite")
                {
                    IsFavorite(request, database);
                }

                // קבלת כל סרטי המועדפים של המשתמש
                else if (request.Name == "getFavoriteMovies")
                {
                    GetFavoriteMovies(request, database);
                }

                // הוספה או הסרה מצפייה בהמשך
                else if (request.Name == "setWatchLater")
                {
                    SetWatchLater(request, database);
                }

                // בדיקה האם סרט נמצא בצפייה בהמשך
                else if (request.Name == "isWatchLater")
                {
                    IsWatchLater(request, database);
                }

                // קבלת כל הסרטים שהמשתמש סימן לצפייה בהמשך
                else if (request.Name == "getWatchLaterMovies")
                {
                    GetWatchLaterMovies(request, database);
                }

                // שמירת דירוג אישי לסרט
                else if (request.Name == "setRating")
                {
                    SetRating(request, database);
                }

                // מחיקת דירוג אישי
                else if (request.Name == "removeRating")
                {
                    RemoveRating(request, database);
                }

                // קבלת הדירוג האישי של המשתמש
                else if (request.Name == "getPersonalScore")
                {
                    GetPersonalScore(request, database);
                }

                // קבלת הדירוג הממוצע של כל המשתמשים
                else if (request.Name == "getGlobalScore")
                {
                    GetGlobalScore(request, database);
                }

                // אם הבקשה לא מוכרת
                else
                {
                    request.SetStatusCode(400);
                }
            }
            catch (Exception exception)
            {
                // במקרה של שגיאה בשרת
                request.SetStatusCode(500);
                Log.WriteException(exception);
            }
        }
    }

    // הרשמת משתמש חדש
    static void SignUp(Request request, Database database)
    {
        var (username, password) = request.GetParams<(string, string)>();

        bool usernameAlreadyExists =
            database.Users.Any(user => user.Name == username);

        if (usernameAlreadyExists)
        {
            request.Respond<string?>(null);
            return;
        }

        string token = Guid.NewGuid().ToString();

        var newUser = new User(token, username, password);

        database.Users.Add(newUser);
        database.SaveChanges();

        request.Respond(token);
    }

    // התחברות משתמש קיים
    static void LogIn(Request request, Database database)
    {
        var (username, password) = request.GetParams<(string, string)>();

        var user = database.Users.FirstOrDefault(user =>
            user.Name == username &&
            user.Password == password
        );

        if (user == null)
        {
            request.Respond<string?>(null);
            return;
        }

        request.Respond(user.Token);
    }

    // קבלת משתמש לפי token
    static void GetUser(Request request, Database database)
    {
        string? token = request.GetParams<string?>();

        if (token == null)
        {
            request.Respond<User?>(null);
            return;
        }

        var user =
            database.Users.FirstOrDefault(user => user.Token == token);

        request.Respond(user);
    }

// הוספת סרט חדש למסד הנתונים
    static void AddMovie(Request request, Database database)
    {
        var (token, title, director, year, image, description) =
            request.GetParams<(string, string, string, int, string, string)>();

        var user =
             GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

    var movie =
        new Movie(title, director, year, image, description, user.Id);

    database.Movies.Add(movie);

    database.SaveChanges();

    request.Respond(true);
}

    // קבלת כל הסרטים
    static void GetMovies(Request request, Database database)
    {
        var movies = database.Movies.ToList();

        request.Respond(movies);
    }

 // מחיקת סרט מהמסד
static void DeleteMovie(Request request, Database database)
{
    var (token, movieId) =
        request.GetParams<(string, int)>();

    var user =
         GetUserByToken(database, token);

    if (user == null)
    {
        request.Respond(false);
        return;
    }

    var movie =
        database.Movies.FirstOrDefault(movie => movie.Id == movieId);

    if (movie == null)
    {
        request.Respond(false);
        return;
    }

    // רק המשתמש שהוסיף את הסרט יכול למחוק אותו
    if (movie.UserId != user.Id)
    {
        request.Respond(false);
        return;
    }

        // מחיקת כל המידע שקשור לסרט לפני מחיקת הסרט עצמו
        database.FavoriteMovies.RemoveRange(
            database.FavoriteMovies.Where(favorite => favorite.MovieId == movieId)
        );

        database.WatchLaterMovies.RemoveRange(
            database.WatchLaterMovies.Where(item => item.MovieId == movieId)
        );

        database.MovieRatings.RemoveRange(
            database.MovieRatings.Where(rating => rating.MovieId == movieId)
        );

        database.Movies.Remove(movie);
        database.SaveChanges();

        request.Respond(true);
    }

    // פונקציית עזר למציאת משתמש לפי token
    static User? GetUserByToken(Database database, string? token)
    {
        if (token == null)
        {
            return null;
        }

        return database.Users.FirstOrDefault(user => user.Token == token);
    }

    // הוספה או הסרה של סרט מהמועדפים
    static void SetFavorite(Request request, Database database)
    {
        var (token, movieId, toAdd) =
            request.GetParams<(string, int, bool)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        var favorite =
            database.FavoriteMovies.FirstOrDefault(favorite =>
                favorite.UserId == user.Id &&
                favorite.MovieId == movieId
            );

        if (toAdd)
        {
            if (favorite == null)
            {
                database.FavoriteMovies.Add(
                    new FavoriteMovie(user.Id, movieId)
                );
            }
        }
        else
        {
            if (favorite != null)
            {
                database.FavoriteMovies.Remove(favorite);
            }
        }

        database.SaveChanges();
        request.Respond(true);
    }

    // בדיקה האם סרט נמצא במועדפים
    static void IsFavorite(Request request, Database database)
    {
        var (token, movieId) =
            request.GetParams<(string, int)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        bool exists =
            database.FavoriteMovies.Any(favorite =>
                favorite.UserId == user.Id &&
                favorite.MovieId == movieId
            );

        request.Respond(exists);
    }

    // קבלת כל סרטי המועדפים של המשתמש
    static void GetFavoriteMovies(Request request, Database database)
    {
        string token = request.GetParams<string>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(Array.Empty<Movie>());
            return;
        }

        var movies =
            database.FavoriteMovies
                .Where(favorite => favorite.UserId == user.Id)
                .Select(favorite => favorite.Movie)
                .ToList();

        request.Respond(movies);
    }

    // הוספה או הסרה של סרט מצפייה בהמשך
    static void SetWatchLater(Request request, Database database)
    {
        var (token, movieId, toAdd) =
            request.GetParams<(string, int, bool)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        var watchLater =
            database.WatchLaterMovies.FirstOrDefault(item =>
                item.UserId == user.Id &&
                item.MovieId == movieId
            );

        if (toAdd)
        {
            if (watchLater == null)
            {
                database.WatchLaterMovies.Add(
                    new WatchLaterMovie(user.Id, movieId)
                );
            }
        }
        else
        {
            if (watchLater != null)
            {
                database.WatchLaterMovies.Remove(watchLater);
            }
        }

        database.SaveChanges();
        request.Respond(true);
    }

    // בדיקה האם סרט נמצא בצפייה בהמשך
    static void IsWatchLater(Request request, Database database)
    {
        var (token, movieId) =
            request.GetParams<(string, int)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        bool exists =
            database.WatchLaterMovies.Any(item =>
                item.UserId == user.Id &&
                item.MovieId == movieId
            );

        request.Respond(exists);
    }

    // קבלת כל הסרטים שהמשתמש סימן לצפייה בהמשך
    static void GetWatchLaterMovies(Request request, Database database)
    {
        string token = request.GetParams<string>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(Array.Empty<Movie>());
            return;
        }

        var movies =
            database.WatchLaterMovies
                .Where(item => item.UserId == user.Id)
                .Select(item => item.Movie)
                .ToList();

        request.Respond(movies);
    }

    // שמירת דירוג אישי לסרט
    static void SetRating(Request request, Database database)
    {
        var (token, movieId, score) =
            request.GetParams<(string, int, int)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        var rating =
            database.MovieRatings.FirstOrDefault(rating =>
                rating.UserId == user.Id &&
                rating.MovieId == movieId
            );

        if (rating == null)
        {
            database.MovieRatings.Add(
                new MovieRating(score, user.Id, movieId)
            );
        }
        else
        {
            rating.Score = score;
        }

        database.SaveChanges();
        request.Respond(true);
    }

    // מחיקת דירוג אישי
    static void RemoveRating(Request request, Database database)
    {
        var (token, movieId) =
            request.GetParams<(string, int)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond(false);
            return;
        }

        var rating =
            database.MovieRatings.FirstOrDefault(rating =>
                rating.UserId == user.Id &&
                rating.MovieId == movieId
            );

        if (rating != null)
        {
            database.MovieRatings.Remove(rating);
            database.SaveChanges();
        }

        request.Respond(true);
    }

    // קבלת הדירוג האישי של המשתמש לסרט
    static void GetPersonalScore(Request request, Database database)
    {
        var (token, movieId) =
            request.GetParams<(string, int)>();

        var user = GetUserByToken(database, token);

        if (user == null)
        {
            request.Respond<int?>(null);
            return;
        }

        var rating =
            database.MovieRatings.FirstOrDefault(rating =>
                rating.UserId == user.Id &&
                rating.MovieId == movieId
            );

        request.Respond(rating?.Score);
    }

    // קבלת דירוג ממוצע של הסרט מכל המשתמשים
    static void GetGlobalScore(Request request, Database database)
    {
        int movieId = request.GetParams<int>();

        var ratings =
            database.MovieRatings.Where(rating => rating.MovieId == movieId);

        if (!ratings.Any())
        {
            request.Respond<double?>(null);
            return;
        }

        double average =
            ratings.Average(rating => rating.Score);

        request.Respond(average);
    }
}

// הגדרת הטבלאות במסד הנתונים
class Database() : DatabaseCore("database")
{
    public DbSet<User> Users { get; set; } = default!;
    public DbSet<Movie> Movies { get; set; } = default!;
    public DbSet<FavoriteMovie> FavoriteMovies { get; set; } = default!;
    public DbSet<WatchLaterMovie> WatchLaterMovies { get; set; } = default!;
    public DbSet<MovieRating> MovieRatings { get; set; } = default!;
}

// מודל של משתמש
class User(string token, string name, string password)
{
    public int Id { get; set; } = default!;

    [JsonIgnore]
    public string Token { get; set; } = token;

    public string Name { get; set; } = name;

    [JsonIgnore]
    public string Password { get; set; } = password;
}

// מודל של סרט
class Movie(string title, string director,int year, string image, string description, int userId)
{   
    public int Id { get; set; } = default!;

    public string Title { get; set; } = title;

    public string Director { get; set; } = director;

    public int Year { get; set; } = year;

    public string Image { get; set; } = image;

    public string Description { get; set; } = description;

    // המשתמש שהוסיף את הסרט
    public int UserId { get; set; } = userId;

    public User User { get; set; } = default!;
}

// טבלה שמחברת בין משתמש לבין סרט שהוא סימן כמועדף
class FavoriteMovie(int userId, int movieId)
{
    public int Id { get; set; } = default!;
    public int UserId { get; set; } = userId;
    public int MovieId { get; set; } = movieId;

    public User User { get; set; } = default!;
    public Movie Movie { get; set; } = default!;
}

// טבלה שמחברת בין משתמש לבין סרט שהוא סימן לצפייה בהמשך
class WatchLaterMovie(int userId, int movieId)
{
    public int Id { get; set; } = default!;
    public int UserId { get; set; } = userId;
    public int MovieId { get; set; } = movieId;

    public User User { get; set; } = default!;
    public Movie Movie { get; set; } = default!;
}

// טבלה ששומרת דירוג של משתמש לסרט מסוים
class MovieRating(int score, int userId, int movieId)
{
    public int Id { get; set; } = default!;
    public int Score { get; set; } = score;
    public int UserId { get; set; } = userId;
    public int MovieId { get; set; } = movieId;

    public User User { get; set; } = default!;
    public Movie Movie { get; set; } = default!;
}