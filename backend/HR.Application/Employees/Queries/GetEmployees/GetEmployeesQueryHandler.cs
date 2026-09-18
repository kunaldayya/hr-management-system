using HR.Application.Common.Models;
using HR.Application.Employees.Common;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Queries.GetEmployees;

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, PaginatedResult<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;

    public GetEmployeesQueryHandler(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    public async Task<PaginatedResult<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var allEmployees = (await _employeeRepository.GetAllAsync(cancellationToken)).ToList();
        var totalCount = allEmployees.Count;

        var items = allEmployees
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EmployeeDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Department = e.Department,
                JobTitle = e.JobTitle,
                Salary = e.Salary,
                Status = e.Status,
                DateOfJoining = e.DateOfJoining,
                CreatedAt = e.CreatedAt
            })
            .ToList();

        return new PaginatedResult<EmployeeDto>(items, totalCount, request.PageIndex, request.PageSize);
    }
}