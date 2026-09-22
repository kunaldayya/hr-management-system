using HR.Domain.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace HR.Domain.Entities;

[BsonIgnoreExtraElements]
public class User : BaseEntity
{
    public string TenantId { get; private set; } = string.Empty;
    public string EmployeeId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public List<string> Roles { get; private set; } = new();
    public bool IsActive { get; private set; } = true;
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    private User() { } 

    public User(string tenantId, string employeeId, string email, string passwordHash, List<string> roles)
    {
        TenantId = tenantId;
        EmployeeId = employeeId;
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        Roles = roles;
    }

    public void UpdateRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
    }
}