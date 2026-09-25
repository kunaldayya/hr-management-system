using HR.Application.Common.Interfaces;
using HR.Application.Common.Models;
using HR.Domain.Interfaces;
using HR.Application.Common.Configurations;
using MediatR;
using Microsoft.Extensions.Options;

namespace HR.Application.Authentication.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Normalize email input
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            // Generic message prevents username enumeration
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is inactive. Please contact support.");
        }

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
        var fullName = $"{user.FirstName} {user.LastName}".Trim();

        user.UpdateRefreshToken(refreshToken, refreshTokenExpiry);
        user.RecordLogin();

        await _userRepository.UpdateAsync(user, cancellationToken);

        return new LoginResultDto(
            user.Id,
            user.Email,
            fullName,
            user.Role,
            accessToken,
            refreshToken,
            refreshTokenExpiry
        );
    }
}