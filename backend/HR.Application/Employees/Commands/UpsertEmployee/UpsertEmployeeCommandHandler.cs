using HR.Application.Common.Interfaces;
using HR.Application.Employees.Common;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Commands.UpsertEmployee;

public class UpsertEmployeeCommandHandler : IRequestHandler<UpsertEmployeeCommand, EmployeeDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UpsertEmployeeCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<EmployeeDto> Handle(UpsertEmployeeCommand request, CancellationToken cancellationToken)
    {
        User? user = null;

        // 1. If Id is provided, attempt to retrieve for update
        if (!string.IsNullOrWhiteSpace(request.Id))
        {
            user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        }

        // 2. If no Id, check by email to prevent duplicate creation
        if (user == null)
        {
            user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        }

        if (user != null)
        {
            // Update existing user's profile
            user.UpdateProfile(
                request.FirstName,
                request.LastName,
                request.JobTitle,
                request.Department,
                request.Salary
            );
            user.UpdateRole(request.Role);
            if (request.DateOfJoining.HasValue)
            {
                user.UpdateDateOfJoining(request.DateOfJoining.Value);
            }

            await _userRepository.UpdateAsync(user, cancellationToken);
        }
        else
        {
            var defaultPassword = "Employee@123";
            var passwordHash = _passwordHasher.HashPassword(defaultPassword);

            user = new User(
                tenantId: "default",
                email: request.Email,
                passwordHash: passwordHash,
                role: request.Role,
                firstName: request.FirstName,
                lastName: request.LastName,
                department: request.Department,
                jobTitle: request.JobTitle,
                salary: request.Salary,
                dateOfJoining: request.DateOfJoining
            );

            await _userRepository.AddAsync(user, cancellationToken);
        }

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