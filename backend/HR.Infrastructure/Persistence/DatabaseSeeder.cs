using HR.Domain.Entities;
using HR.Domain.Enums;
using HR.Infrastructure.Authentication;
using HR.Infrastructure.Configurations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HR.Infrastructure.Persistence;

/// <summary>
/// Runs on startup: removes legacy corrupt documents and seeds default users for all 3 roles.
/// </summary>
public static class DatabaseSeeder
{
    private const string DefaultPassword = "Password123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<MongoContext>>();

        try
        {
            var mongoSettings = scope.ServiceProvider.GetRequiredService<IOptions<MongoSettings>>().Value;
            var client = new MongoClient(
                string.IsNullOrWhiteSpace(mongoSettings.ConnectionString)
                    ? "mongodb://localhost:27017"
                    : mongoSettings.ConnectionString
            );
            var database = client.GetDatabase(
                string.IsNullOrWhiteSpace(mongoSettings.DatabaseName)
                    ? "HRManagementDb"
                    : mongoSettings.DatabaseName
            );

            var usersCollection = database.GetCollection<BsonDocument>("users");

            // ── 1. Remove legacy documents where _id is an ObjectId (not a string) ───────
            // These were created before BaseEntity had [BsonId], and they cannot be
            // updated or serialized correctly by the current domain model.
            var legacyFilter = Builders<BsonDocument>.Filter.Type("_id", BsonType.ObjectId);
            var legacyCount = await usersCollection.CountDocumentsAsync(legacyFilter);
            if (legacyCount > 0)
            {
                logger.LogWarning("DatabaseSeeder: Removing {Count} legacy user document(s) with ObjectId _id.", legacyCount);
                await usersCollection.DeleteManyAsync(legacyFilter);
            }

            // ── 2. Seed default users ────────────────────────────────────────────────────
            var hasher = new PasswordHasher();
            var typedCollection = database.GetCollection<User>("users");

            var seedUsers = new[]
            {
                (Email: "admin@hrms.com",    Role: UserRole.Admin,    FirstName: "Admin",    LastName: "User"),
                (Email: "hr@hrms.com",       Role: UserRole.HR,       FirstName: "HR",       LastName: "Manager"),
                (Email: "employee@hrms.com", Role: UserRole.Employee, FirstName: "John",     LastName: "Employee"),
            };

            foreach (var (email, role, firstName, lastName) in seedUsers)
            {
                var existing = await typedCollection
                    .Find(u => u.Email == email)
                    .FirstOrDefaultAsync();

                if (existing == null)
                {
                    var user = new User(
                        tenantId: "default",
                        email: email,
                        passwordHash: hasher.HashPassword(DefaultPassword),
                        role: role,
                        firstName: firstName,
                        lastName: lastName
                    );

                    await typedCollection.InsertOneAsync(user);
                    logger.LogInformation("DatabaseSeeder: Created seed user {Email} with role {Role}.", email, role);
                }
                else
                {
                    logger.LogDebug("DatabaseSeeder: Seed user {Email} already exists — skipping.", email);
                }
            }

            logger.LogInformation("DatabaseSeeder: Seeding complete.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "DatabaseSeeder: Failed during database seeding.");
        }
    }
}
