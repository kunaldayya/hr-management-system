using HR.Domain.Enums;
using MediatR;

namespace HR.Application.Employees.Commands.CreateEmployee;

public record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string Email,
    Department Department,
    string JobTitle,
    decimal Salary,
    DateTime DateOfJoining
) : IRequest<string>;
