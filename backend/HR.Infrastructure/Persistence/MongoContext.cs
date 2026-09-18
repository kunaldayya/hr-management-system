using HR.Application.Common.Interfaces;
using HR.Infrastructure.Configurations;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace HR.Infrastructure.Persistence;

public class MongoContext(IOptions<MongoSettings> options) : IMongoContext
{
    public IMongoDatabase Database { get; } = new MongoClient(
        string.IsNullOrWhiteSpace(options.Value.ConnectionString) ? "mongodb://localhost:27017" : options.Value.ConnectionString
    ).GetDatabase(
        string.IsNullOrWhiteSpace(options.Value.DatabaseName) ? "HRManagementDb" : options.Value.DatabaseName
    );

    public IMongoCollection<T> GetCollection<T>(string name) => Database.GetCollection<T>(name);
}