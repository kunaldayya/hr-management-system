using HR.Application.Common.Models;
using HR.Application.Employees.Common;
using MediatR;

namespace HR.Application.Employees.Queries.GetEmployees;

public record GetEmployeesQuery(int PageIndex = 1, int PageSize = 10) : IRequest<PaginatedResult<EmployeeDto>>;