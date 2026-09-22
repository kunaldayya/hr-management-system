namespace HR.Application.Common.Models;

public record AuthUserDto(
    string Email,
    List<string> Roles
);