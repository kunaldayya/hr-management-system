using HR.Application.Employees.Common;
using HR.Domain.Enums;
using MediatR;

namespace HR.Application.Employees.Commands.UpsertEmployee;

public record UpsertEmployeeCommand(
    string? Id, 
    string FirstName,
    string LastName,
    string Email,
    Department Department,
    string JobTitle,
    decimal Salary,
    DateTime DateOfJoining
) : IRequest<EmployeeDto>;