namespace HR.Application.Common.Models;

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpiryTime,
    string Email,
    List<string> Roles
);