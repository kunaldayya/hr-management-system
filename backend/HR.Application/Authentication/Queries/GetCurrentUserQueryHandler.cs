using HR.Application.Authentication.Common;
using HR.Domain.Entities;
using HR.Domain.Enums;
using HR.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HR.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, CurreUserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetCurrentUserQueryHandler(IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<CurreUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userClaims = httpContext?.User;

            if (httpContext == null || userClaims?.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var userId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? userClaims.FindFirst("sub")?.Value;

            var email = userClaims.FindFirst(ClaimTypes.Email)?.Value
                     ?? userClaims.FindFirst("email")?.Value
                     ?? userClaims.FindFirst(ClaimTypes.Name)?.Value;

            User? user = null;
            if (!string.IsNullOrEmpty(userId))
            {
                user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            }

            if (user == null && !string.IsNullOrEmpty(email))
            {
                user = await _userRepository.GetByEmailAsync(email, cancellationToken);
            }

            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            if (string.IsNullOrEmpty(fullName))
            {
                fullName = user.Email.Split('@')[0];
            }

            if (!string.IsNullOrEmpty(fullName))
            {
                fullName = char.ToUpper(fullName[0]) + fullName.Substring(1);
            }

            // FIX: Pass user.Role directly as UserRole instead of a List<string>
            return new CurreUserDto(user.Email, user.Role, fullName);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // FIX: Pass a valid default UserRole value (e.g., UserRole.Employee)
            return new CurreUserDto(string.Empty, UserRole.Employee, string.Empty);
        }
    }
}