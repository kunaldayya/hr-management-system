using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Enums;
using HR.Domain.Interfaces;
using HR.Infrastructure.Persistence;
using MongoDB.Driver;

namespace HR.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(IMongoContext context)
    {
        _users = context.GetCollection<User>("users");
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default) =>
        await _users.Find(u => u.Id == id).FirstOrDefaultAsync(cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _users.Find(u => u.Email == email.ToLowerInvariant()).FirstOrDefaultAsync(cancellationToken);

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default) =>
        await _users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync(cancellationToken);

    public async Task<IEnumerable<User>> GetAllByRoleAsync(UserRole role, CancellationToken cancellationToken = default) =>
        await _users.Find(u => u.Role == role).ToListAsync(cancellationToken);

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _users.Find(_ => true).ToListAsync(cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
        await _users.InsertOneAsync(user, cancellationToken: cancellationToken);

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default) =>
        await _users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        await _users.DeleteOneAsync(u => u.Id == id, cancellationToken);
}