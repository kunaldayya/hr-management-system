using HR.Application.Common.Configurations;
using HR.Application.Common.Interfaces;
using HR.Application.Common.Models;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace HR.Application.Authentication.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, RegisterUserResultDto>
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

    public async Task<RegisterUserResultDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User(
            tenantId: request.TenantId,
            email: normalizedEmail,
            passwordHash: passwordHash,
            role: request.Role,
            firstName: request.FirstName,
            lastName: request.LastName,
            department: request.Department,
            jobTitle: request.JobTitle,
            salary: request.Salary,
            dateOfJoining: request.DateOfJoining
        );

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);

        user.UpdateRefreshToken(refreshToken, refreshTokenExpiry);
        await _userRepository.AddAsync(user, cancellationToken);

        var fullName = $"{user.FirstName} {user.LastName}".Trim();

        return new RegisterUserResultDto(
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