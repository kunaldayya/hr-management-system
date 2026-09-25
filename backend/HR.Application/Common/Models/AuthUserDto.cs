using HR.Domain.Enums;

namespace HR.Application.Common.Models;

public record AuthUserDto(
    string Id,
    string Email,
    string FullName,
    UserRole Role
);