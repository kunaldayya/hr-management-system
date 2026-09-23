using HR.Application.Common.Models;
using HR.Application.Employees.Common;
using HR.Domain.Enums;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Queries.GetEmployees;

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, PaginatedResult<EmployeeDto>>
{
    private readonly IUserRepository _userRepository;

    public GetEmployeesQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PaginatedResult<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        // Return all users who are employees or HR (i.e., staff managed in the system)
        var allUsers = (await _userRepository.GetAllAsync(cancellationToken))
            .Where(u => u.Role == UserRole.Employee || u.Role == UserRole.HR)
            .OrderByDescending(u => u.CreatedAt)
            .ToList();
        var totalCount = allUsers.Count;

        var items = allUsers
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new EmployeeDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                Department = u.Department,
                JobTitle = u.JobTitle,
                Salary = u.Salary,
                Status = u.Status,
                DateOfJoining = u.DateOfJoining,
                CreatedAt = u.CreatedAt
            })
            .ToList();

        return new PaginatedResult<EmployeeDto>(items, totalCount, request.PageIndex, request.PageSize);
    }
}