using HR.Application.Authentication.Commands.Login;
using HR.Application.Authentication.Commands.RegisterUser;
using HR.Application.Authentication.Common;
using HR.Application.Common.Models;
using HR.Application.Features.Auth.Commands.Logout;
using HR.Application.Features.Auth.Queries.GetCurrentUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HR.Api.Controllers;

public class AuthController : BaseApiController
{
    private bool IsDevelopment =>
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

    [HttpPost("register")]
    public async Task<ApiResponse<AuthUserDto>> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        var userDto = new AuthUserDto(result.Email, result.Role, result.AccessToken);
        return ApiResponse<AuthUserDto>.Success(userDto, "User registered successfully");
    }

    [HttpPost("login")]
    public async Task<ApiResponse<AuthUserDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        // Return the access token in the body so the frontend can store it in localStorage
        // This allows Authorization: Bearer <token> to work regardless of cookie support
        var userDto = new AuthUserDto(result.Email, result.Role, result.AccessToken);
        return ApiResponse<AuthUserDto>.Success(userDto, "User authenticated successfully");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ApiResponse<CurreUserDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetCurrentUserQuery(), cancellationToken);
        return Response(result, "User session is valid");
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<ApiResponse<bool>> Logout(CancellationToken cancellationToken)
    {
        // Always clear cookies regardless of whether user is authenticated
        var deleteCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !IsDevelopment,
            SameSite = IsDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/"
        };

        HttpContext.Response.Cookies.Delete("accessToken", deleteCookieOptions);
        HttpContext.Response.Cookies.Delete("refreshToken", deleteCookieOptions);

        // Also attempt plain delete as fallback
        HttpContext.Response.Cookies.Delete("accessToken");
        HttpContext.Response.Cookies.Delete("refreshToken");

        // Attempt to revoke refresh token in DB — never throws, logout always succeeds
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");

            if (!string.IsNullOrEmpty(userId))
            {
                await Mediator.Send(new LogoutCommand(userId), cancellationToken);
            }
        }
        catch
        {
            // Swallow — user is already logged out on the client side
        }

        return ApiResponse<bool>.Success(true, "User logged out successfully");
    }

    private void SetTokenCookies(string accessToken, string refreshToken, DateTime refreshTokenExpiry)
    {
        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !IsDevelopment,
            SameSite = IsDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/",
            Expires = DateTime.UtcNow.AddMinutes(60)
        };

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !IsDevelopment,
            SameSite = IsDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
            Path = "/",
            Expires = refreshTokenExpiry
        };

        HttpContext.Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);
        HttpContext.Response.Cookies.Append("refreshToken", refreshToken, refreshCookieOptions);
    }
}