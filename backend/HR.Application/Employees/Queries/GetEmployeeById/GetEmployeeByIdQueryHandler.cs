using HR.Application.Employees.Common;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Queries.GetEmployeeById;

public class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, EmployeeDto?>
{
    private readonly IUserRepository _userRepository;

    public GetEmployeeByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<EmployeeDto?> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null) return null;

        return new EmployeeDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Department = user.Department,
            JobTitle = user.JobTitle,
            Salary = user.Salary,
            Status = user.Status,
            DateOfJoining = user.DateOfJoining,
            CreatedAt = user.CreatedAt
        };
    }
}