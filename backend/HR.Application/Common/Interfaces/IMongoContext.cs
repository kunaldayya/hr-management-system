using HR.Domain.Entities;
using MongoDB.Driver;

namespace HR.Application.Common.Interfaces
{
    public interface IMongoContext
    {
        IMongoDatabase Database { get; }
        IMongoCollection<T> GetCollection<T>(string name);

        IMongoCollection<AttendanceRecord> AttendanceRecords { get; }
        IMongoCollection<User> Users { get; }
    }
}
