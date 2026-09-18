using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;

namespace HR.Application.Employees.Commands.CreateEmployee;

public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, string>
{
    private readonly IEmployeeRepository _employeeRepository;

    public CreateEmployeeCommandHandler(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    public async Task<string> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var existingEmployee = await _employeeRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmployee != null)
        {
            throw new InvalidOperationException($"An employee with email '{request.Email}' already exists.");
        }

        var employee = new Employee(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Department,
            request.JobTitle,
            request.Salary,
            request.DateOfJoining
        );

        await _employeeRepository.AddAsync(employee, cancellationToken);

        return employee.Id;
    }
}