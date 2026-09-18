using HR.Application.Common.Models;
using HR.Application.Employees.Commands.DeleteEmployee;
using HR.Application.Employees.Commands.UpsertEmployee;
using HR.Application.Employees.Common;
using HR.Application.Employees.Queries.GetEmployeeById;
using HR.Application.Employees.Queries.GetEmployees;
using Microsoft.AspNetCore.Mvc;

namespace HR.Api.Controllers;

public class EmployeesController : BaseApiController
{
    [HttpPost("upsert")]
    public async Task<ApiResponse<EmployeeDto>> Upsert(
        [FromBody] UpsertEmployeeCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        string actionMessage = string.IsNullOrWhiteSpace(command.Id)
            ? "Employee created successfully"
            : "Employee updated successfully";

        return Response(result, actionMessage);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<EmployeeDto?>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetEmployeeByIdQuery(id), cancellationToken);
        return Response(result, result != null ? "Employee found" : "Employee not found");
    }

    [HttpGet]
    public async Task<ApiResponse<PaginatedResult<EmployeeDto>>> GetPaged(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEmployeesQuery(pageIndex, pageSize);
        var result = await Mediator.Send(query, cancellationToken);
        return Response(result, "Employees retrieved successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ApiResponse<bool>> Delete(
        string id,
        CancellationToken cancellationToken)
    {
        var success = await Mediator.Send(new DeleteEmployeeCommand(id), cancellationToken);
        return Response(success, success ? "Employee deleted successfully" : "Employee not found");
    }
}