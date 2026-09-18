using HR.Application.Authentication.Commands.Login;
using HR.Application.Authentication.Commands.RegisterUser;
using HR.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace HR.Api.Controllers;

public class AuthController : BaseApiController
{
    [HttpPost("register")]
    public async Task<ApiResponse<AuthResponseDto>> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return Response(result, "User registered successfully");
    }

    [HttpPost("login")]
    public async Task<ApiResponse<AuthResponseDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return Response(result, "User authenticated successfully");
    }
}