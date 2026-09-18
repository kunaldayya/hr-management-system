using HR.Application.Common.Interfaces;
using HR.Infrastructure.Configurations;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace HR.Infrastructure.Persistence
{
    public class MongoContext : IMongoContext
    {
        public IMongoDatabase Database { get; }

        public MongoContext(IOptions<MongoSettings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            Database = client.GetDatabase(options.Value.DatabaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string name) =>
            Database.GetCollection<T>(name);
    }
}
