using HR.Domain.Enums;

namespace HR.Application.Common.Models;

public record AuthResponseDto(
    string AccessToken,
    DateTime AccessTokenExpiration,
    string Email,
    UserRole Role,
    string UserId
);

public record RegisterUserResultDto(
    string Id,
    string Email,
    string FullName,
    UserRole Role,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpiryTime
);

public record LoginResultDto(
    string Id,
    string Email,
    string FullName,
    UserRole Role,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpiryTime
);