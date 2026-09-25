using HR.Application.Authentication.Commands.Login;
using HR.Application.Authentication.Commands.RegisterUser;
using HR.Application.Authentication.Common;
using HR.Application.Common.Models;
using HR.Application.Features.Auth.Commands.Logout;
using HR.Application.Features.Auth.Queries.GetCurrentUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HR.Api.Controllers;

public class AuthController : BaseApiController
{

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ApiResponse<AuthUserDto>> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        // ✅ Pass all 4 arguments
        var userDto = new AuthUserDto(
            result.Id,
            result.Email,
            result.FullName,
            result.Role
        );

        return ApiResponse<AuthUserDto>.Success(userDto, "User registered successfully");
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ApiResponse<AuthUserDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        SetTokenCookies(result.AccessToken, result.RefreshToken, result.RefreshTokenExpiryTime);

        var userDto = new AuthUserDto(
            result.Id,
            result.Email,
            result.FullName,
            result.Role
        );

        return ApiResponse<AuthUserDto>.Success(userDto, "User authenticated successfully");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ApiResponse<CurreUserDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetCurrentUserQuery(), cancellationToken);
        return ApiResponse<CurreUserDto>.Success(result, "User session is valid");
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<ApiResponse<bool>> Logout(CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
            var refreshToken = Request.Cookies["refreshToken"];

            if (!string.IsNullOrEmpty(userId) || !string.IsNullOrEmpty(refreshToken))
            {
                await Mediator.Send(new LogoutCommand(userId ?? string.Empty, refreshToken), cancellationToken);
            }
        }
        catch
        {
            // Client logout should still succeed if token revoke fails.
        }

        var deleteOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        };

        HttpContext.Response.Cookies.Delete("accessToken", deleteOptions);
        HttpContext.Response.Cookies.Delete("refreshToken", deleteOptions);

        return ApiResponse<bool>.Success(true, "User logged out successfully");
    }

    private void SetTokenCookies(string accessToken, string refreshToken, DateTime refreshTokenExpiry)
    {
        // Both cookies use Path="/" so they are sent on every request and
        // can be reliably deleted on logout with matching options.
        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = DateTime.UtcNow.AddMinutes(15)
        };

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = refreshTokenExpiry
        };

        HttpContext.Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);
        HttpContext.Response.Cookies.Append("refreshToken", refreshToken, refreshCookieOptions);
    }
}