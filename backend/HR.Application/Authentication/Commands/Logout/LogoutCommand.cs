namespace HR.Application.Features.Auth.Commands.Logout
{
    public record LogoutCommand(string UserId, string? RefreshToken = null) : MediatR.IRequest<bool>;
}