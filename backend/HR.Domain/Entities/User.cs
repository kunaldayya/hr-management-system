using HR.Domain.Common;
using HR.Domain.Enums;
using MongoDB.Bson.Serialization.Attributes;

namespace HR.Domain.Entities;

[BsonIgnoreExtraElements]
public class User : BaseEntity
{
    // ── Auth fields ──────────────────────────────────────────────────────────
    public string TenantId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    // ── Profile / HR fields (populated for Employee & HR roles) ─────────────
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public Department? Department { get; private set; }
    public string JobTitle { get; private set; } = string.Empty;
    public decimal Salary { get; private set; }
    public EmployeeStatus Status { get; private set; } = EmployeeStatus.Probation;
    public DateTime? DateOfJoining { get; private set; }

    private User() { }

    /// <summary>
    /// Creates a new user with auth credentials and an assigned role.
    /// Profile fields are optional at registration and can be filled later via UpdateProfile.
    /// </summary>
    public User(
        string tenantId,
        string email,
        string passwordHash,
        UserRole role,
        string firstName = "",
        string lastName = "",
        Department? department = null,
        string jobTitle = "",
        decimal salary = 0,
        DateTime? dateOfJoining = null)
    {
        TenantId = tenantId;
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = role;
        FirstName = firstName;
        LastName = lastName;
        Department = department;
        JobTitle = jobTitle;
        Salary = salary;
        DateOfJoining = dateOfJoining;
    }

    // ── Auth methods ─────────────────────────────────────────────────────────

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
        UpdatedAt = DateTime.UtcNow;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
    }

    // ── Profile methods ───────────────────────────────────────────────────────

    public void UpdateProfile(
        string firstName,
        string lastName,
        string jobTitle,
        Department? department,
        decimal salary)
    {
        FirstName = firstName;
        LastName = lastName;
        JobTitle = jobTitle;
        Department = department;
        Salary = salary;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeStatus(EmployeeStatus newStatus)
    {
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDateOfJoining(DateTime dateOfJoining)
    {
        DateOfJoining = dateOfJoining;
        UpdatedAt = DateTime.UtcNow;
    }
}