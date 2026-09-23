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
            // 1. Fetch user from DB
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user == null) return false;

            // 2. Execute domain logic to clear token
            user.RevokeRefreshToken();

            // 3. Save changes
            await _userRepository.UpdateAsync(user, cancellationToken);

            return true;
        }
    }
}