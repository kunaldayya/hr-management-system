using HR.Application.Authentication.Commands.Login;
using HR.Application.Authentication.Commands.RegisterUser;
using HR.Application.Common.Models;
using HR.Application.Features.Auth.Commands.Logout;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HR.Api.Controllers;

public class AuthController : BaseApiController
{
    [HttpPost("register")]
    public async Task<ApiResponse<AuthUserDto>> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        var userDto = new AuthUserDto(result.Email, result.Roles);
        return ApiResponse<AuthUserDto>.Success(userDto, "User registered successfully");
    }

    [HttpPost("login")]
    public async Task<ApiResponse<AuthUserDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        var userDto = new AuthUserDto(result.Email, result.Roles);
        return ApiResponse<AuthUserDto>.Success(userDto, "User authenticated successfully");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ApiResponse<AuthUserDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        // Fetch user details from database using userId...
        // For demonstration, let's assume you fetch user and roles:
        var email = User.FindFirstValue(ClaimTypes.Email);
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        var userDto = new AuthUserDto(email, roles);
        return ApiResponse<AuthUserDto>.Success(userDto, "User session is valid");
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ApiResponse<bool>> Logout(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userId))
        {
            return ApiResponse<bool>.Success(false, "Unauthorized user");
        }

        var command = new LogoutCommand(userId);
        var result = await Mediator.Send(command, cancellationToken);

        // Options MUST match the attributes used when creating the cookies
        var deleteCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        };

        HttpContext.Response.Cookies.Delete("accessToken", deleteCookieOptions);
        HttpContext.Response.Cookies.Delete("refreshToken", deleteCookieOptions);

        return ApiResponse<bool>.Success(result, "User logged out successfully");
    }

    private void SetTokenCookies(string accessToken, string refreshToken, DateTime refreshTokenExpiry)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        // FIX: Explicitly use HttpContext here as well
        HttpContext.Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(60)
        });

        HttpContext.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = refreshTokenExpiry
        });
    }
}