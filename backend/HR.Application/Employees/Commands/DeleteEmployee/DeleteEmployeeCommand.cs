using MediatR;

namespace HR.Application.Employees.Commands.DeleteEmployee;

public record DeleteEmployeeCommand(string Id) : IRequest<bool>;