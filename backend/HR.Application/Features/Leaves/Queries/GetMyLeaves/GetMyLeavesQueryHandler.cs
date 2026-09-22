using HR.Application.Common.Interfaces;
using HR.Application.Features.Leaves.Queries.Dtos;
using HR.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System.Security.Claims;

namespace HR.Application.Features.Leaves.Queries.GetMyLeaves;

public class GetMyLeavesQueryHandler : IRequestHandler<GetMyLeavesQuery, List<LeaveRequestDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMyLeavesQueryHandler(IMongoContext mongoContext, IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<LeaveRequestDto>> Handle(GetMyLeavesQuery request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user?.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");
        var employeesCollection = _mongoContext.GetCollection<Employee>("Employees");

        // Fetch leave requests for the logged-in user
        var leaves = await leavesCollection
            .Find(l => l.EmployeeId == userId)
            .ToListAsync(cancellationToken);

        // Fetch employee details for the logged-in user
        var employee = await employeesCollection
            .Find(e => e.Id == userId)
            .FirstOrDefaultAsync(cancellationToken);

        var employeeName = employee != null
            ? $"{employee.FirstName} {employee.LastName}".Trim()
            : string.Empty;

        return leaves.Select(l => new LeaveRequestDto
        {
            Id = l.Id,
            EmployeeId = l.EmployeeId,
            EmployeeName = employeeName,
            LeaveType = l.LeaveType.ToString(),
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            Reason = l.Reason,
            Status = l.Status.ToString(),
            AdminRemarks = l.AdminRemarks
        }).ToList();
    }
}