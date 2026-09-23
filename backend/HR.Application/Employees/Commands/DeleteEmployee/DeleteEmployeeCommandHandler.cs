using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Commands.DeleteEmployee;

public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public DeleteEmployeeCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null) return false;

        await _userRepository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}