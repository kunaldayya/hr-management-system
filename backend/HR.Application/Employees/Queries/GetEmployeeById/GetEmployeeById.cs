using HR.Application.Employees.Common;
using MediatR;

namespace HR.Application.Employees.Queries.GetEmployeeById;

public record GetEmployeeByIdQuery(string Id) : IRequest<EmployeeDto?>;