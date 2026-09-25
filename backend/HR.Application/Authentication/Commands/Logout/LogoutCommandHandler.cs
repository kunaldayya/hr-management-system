using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Features.Auth.Commands.Logout
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public LogoutCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            User? user = null;

            if (!string.IsNullOrEmpty(request.UserId))
            {
                user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            }

            if (user == null && !string.IsNullOrEmpty(request.RefreshToken))
            {
                user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken);
            }

            if (user == null) return false;

            user.RevokeRefreshToken();
            await _userRepository.UpdateAsync(user, cancellationToken);

            return true;
        }
    }
}
