using HR.Application.Common.Models;
using HR.Domain.Enums;
using MediatR;

namespace HR.Application.Authentication.Commands.RegisterUser;

public record RegisterUserCommand(
    string TenantId,
    string Email,
    string Password,
    UserRole Role,
    string FirstName = "",
    string LastName = "",
    Department? Department = null,
    string JobTitle = "",
    decimal Salary = 0,
    DateTime? DateOfJoining = null
) : IRequest<AuthResponseDto>;
