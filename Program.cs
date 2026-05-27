using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
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
        Console.WriteLine($"Local:    http://localhost:{port}/website/pages/login.html");
        Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/login.html");

        while (true)
        {
            var request = server.WaitForRequest();

            Console.WriteLine($"Recieved a request: {request.Name}");

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
                else
                {
                    request.SetStatusCode(400); // בקשה לא מוכרת
                }
            }
            catch (Exception exception)
            {
                request.SetStatusCode(500);
                Log.WriteException(exception);
            }
        }
    }

    // --- פונקציות הטיפול בבקשות ---

    static void SignUp(Request request, Database database)
    {
        var (username, password) = request.GetParams<(string, string)>();

        bool usernameAlreadyExists = database.Users.Any(user => user.Name == username);

        if (usernameAlreadyExists)
        {
            request.Respond<string?>(null);
            return;
        }

        string token = Guid.NewGuid().ToString();
        var newUser = new User(token, username, password);

        database.Users.Add(newUser);
        database.SaveChanges(); // שמירה פיזית במסד הנתונים

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

        var user = database.Users.FirstOrDefault(user => user.Token == token);

        request.Respond(user);
    }
} // <--- סגירה תקינה של מחלקת Program

// ==========================================
//          הגדרות ה-Database והמודלים
// ==========================================

class Database() : DatabaseCore("database")
{
    public DbSet<User> Users { get; set; } = default!;
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