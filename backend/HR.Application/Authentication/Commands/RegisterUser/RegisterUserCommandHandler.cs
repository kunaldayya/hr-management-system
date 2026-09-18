using HR.Application.Common.Interfaces;
using HR.Application.Common.Models;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using HR.Application.Common.Configurations;
using MediatR;
using Microsoft.Extensions.Options;

namespace HR.Application.Authentication.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;

    public RegisterUserCommandHandler(
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

    public async Task<AuthResponseDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var user = new User(
            tenantId: request.TenantId,
            email: request.Email,
            passwordHash: passwordHash,
            roles: request.Roles,
            employeeId: request.EmployeeId
        );

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);

        user.UpdateRefreshToken(refreshToken, refreshTokenExpiry);
        await _userRepository.AddAsync(user, cancellationToken);

        return new AuthResponseDto(
            accessToken,
            refreshToken,
            refreshTokenExpiry,
            user.Email,
            user.Roles
        );
    }
}