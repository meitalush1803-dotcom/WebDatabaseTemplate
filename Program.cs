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
        int port = 5000;

        var server = new Server(port);
        var database = new Database();

        Console.WriteLine("The server is running");
        Console.WriteLine($"Local:    http://localhost:{port}/website/pages/loginsignup.html");
        Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/loginsignup.html");

        while (true)
        {
            var request = server.WaitForRequest();

            Console.WriteLine($"Received a request: {request.Name}");

            try
            {
                if (request.Name == "signUp")
                {
                    SignUp(request, database);
                }
                else if (request.Name == "logIn")
                {
                    LogIn(request, database);
                }
                else if (request.Name == "getUser")
                {
                    GetUser(request, database);
                }
                else if (request.Name == "addMovie")
                {
                    AddMovie(request, database);
                }
                else if (request.Name == "getMovies")
                {
                    GetMovies(request, database);
                }
                else if (request.Name == "deleteMovie")
                {
                    DeleteMovie(request, database);
                }
                else
                {
                    request.SetStatusCode(400);
                }
            }
            catch (Exception exception)
            {
                request.SetStatusCode(500);
                Log.WriteException(exception);
            }
        }
    }

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

    static void AddMovie(Request request, Database database)
    {
        var (title, director, image, description) =
            request.GetParams<(string, string, string, string)>();

        var movie = new Movie(title, director, image, description);

        database.Movies.Add(movie);
        database.SaveChanges();

        request.Respond(true);
    }

    static void GetMovies(Request request, Database database)
    {
        var movies = database.Movies.ToList();

        request.Respond(movies);
    }

    static void DeleteMovie(Request request, Database database)
    {
        int movieId = request.GetParams<int>();

        var movie =
            database.Movies.FirstOrDefault(movie => movie.Id == movieId);

        if (movie == null)
        {
            request.Respond(false);
            return;
        }

        database.Movies.Remove(movie);
        database.SaveChanges();

        request.Respond(true);
    }
}

class Database() : DatabaseCore("database")
{
    public DbSet<User> Users { get; set; } = default!;

    public DbSet<Movie> Movies { get; set; } = default!;
}

class User(string token, string name, string password)
{
    public int Id { get; set; } = default!;

    [JsonIgnore]
    public string Token { get; set; } = token;

    public string Name { get; set; } = name;

    [JsonIgnore]
    public string Password { get; set; } = password;
}

class Movie(string title, string director, string image, string description)
{
    public int Id { get; set; } = default!;

    public string Title { get; set; } = title;

    public string Director { get; set; } = director;

    public string Image { get; set; } = image;

    public string Description { get; set; } = description;
}