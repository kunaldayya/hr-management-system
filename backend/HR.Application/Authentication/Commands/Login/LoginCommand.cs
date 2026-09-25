using HR.Application.Common.Models;
using MediatR;

namespace HR.Application.Authentication.Commands.Login;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<LoginResultDto>;