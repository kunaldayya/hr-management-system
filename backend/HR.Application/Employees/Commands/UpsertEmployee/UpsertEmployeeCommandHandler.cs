using HR.Application.Employees.Common;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Commands.UpsertEmployee;

public class UpsertEmployeeCommandHandler : IRequestHandler<UpsertEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _employeeRepository;

    public UpsertEmployeeCommandHandler(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    public async Task<EmployeeDto> Handle(UpsertEmployeeCommand request, CancellationToken cancellationToken)
    {
        Employee? employee = null;

        // 1. If Id is provided, attempt to retrieve for update
        if (!string.IsNullOrWhiteSpace(request.Id))
        {
            employee = await _employeeRepository.GetByIdAsync(request.Id, cancellationToken);
        }

        // 2. If no Id, check by email to prevent duplicate registration
        if (employee == null)
        {
            employee = await _employeeRepository.GetByEmailAsync(request.Email, cancellationToken);
        }

        if (employee != null)
        {
            // Update Existing Record
            employee.UpdateProfile(
                request.FirstName,
                request.LastName,
                request.JobTitle,
                request.Department,
                request.Salary
            );

            await _employeeRepository.UpdateAsync(employee, cancellationToken);
        }
        else
        {
            // Insert New Record
            employee = new Employee(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Department,
                request.JobTitle,
                request.Salary,
                request.DateOfJoining
            );

            await _employeeRepository.AddAsync(employee, cancellationToken);
        }

        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            Department = employee.Department,
            JobTitle = employee.JobTitle,
            Salary = employee.Salary,
            Status = employee.Status,
            DateOfJoining = employee.DateOfJoining,
            CreatedAt = employee.CreatedAt
        };
    }
}