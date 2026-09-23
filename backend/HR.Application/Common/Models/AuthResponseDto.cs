using HR.Domain.Enums;

namespace HR.Application.Common.Models;

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpiryTime,
    string Email,
    UserRole Role
);