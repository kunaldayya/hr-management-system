using HR.Domain.Enums;

namespace HR.Application.Common.Models;

public record AuthUserDto(
    string Email,
    UserRole Role,
    string? AccessToken = null
);