using HR.Domain.Enums;

namespace HR.Application.Authentication.Common;

public record CurreUserDto(
    string Email,
    UserRole Role,
    string FullName
);