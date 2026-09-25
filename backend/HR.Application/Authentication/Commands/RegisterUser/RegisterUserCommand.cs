using HR.Application.Common.Models;
using HR.Domain.Enums;
using MediatR;

namespace HR.Application.Authentication.Commands.RegisterUser;

public record RegisterUserCommand(
    string TenantId,
    string Email,
    string Password,
    UserRole Role,
    string FirstName,
    string LastName,
    Department Department,
    string? JobTitle,
    decimal Salary,
    DateTime DateOfJoining
) : IRequest<RegisterUserResultDto>;