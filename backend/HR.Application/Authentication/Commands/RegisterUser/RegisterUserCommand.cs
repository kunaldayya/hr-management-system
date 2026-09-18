using HR.Application.Common.Models;
using MediatR;

namespace HR.Application.Authentication.Commands.RegisterUser;

public record RegisterUserCommand(
    string TenantId,
    string Email,
    string Password,
    List<string> Roles,
    string? EmployeeId = null
) : IRequest<AuthResponseDto>;
