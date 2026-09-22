using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using HR.Application.Features.Leaves.Queries.Dtos;

namespace HR.Application.Features.Leaves.Queries.GetAllLeaves;

public class GetAllLeavesQueryHandler : IRequestHandler<GetAllLeavesQuery, List<LeaveRequestDto>>
{
    private readonly IMongoContext _mongoContext;

    public GetAllLeavesQueryHandler(IMongoContext mongoContext)
    {
        _mongoContext = mongoContext;
    }

    public async Task<List<LeaveRequestDto>> Handle(GetAllLeavesQuery request, CancellationToken cancellationToken)
    {
        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");
        var employeesCollection = _mongoContext.GetCollection<Employee>("Employees");

        // Fetch all leave requests sorted by StartDate descending
        var leaves = await leavesCollection
            .Find(FilterDefinition<LeaveRequest>.Empty)
            .SortByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);

        // Normalize IDs to strings for reliable dictionary mapping
        var employeeIds = leaves
            .Select(l => l.EmployeeId?.ToString())
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        // Fetch employees matching the IDs (handling string comparison safely)
        var employees = await employeesCollection
            .Find(e => employeeIds.Contains(e.Id.ToString()))
            .ToListAsync(cancellationToken);

        // Create a lookup dictionary using string keys
        var employeeMap = employees.ToDictionary(e => e.Id.ToString(), e => e);

        return leaves.Select(l =>
        {
            string empIdStr = l.EmployeeId?.ToString() ?? string.Empty;
            employeeMap.TryGetValue(empIdStr, out var employee);

            return new LeaveRequestDto
            {
                Id = l.Id.ToString(),
                EmployeeId = empIdStr,
                EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}".Trim() : "Unknown Employee",
                LeaveType = l.LeaveType.ToString(),
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Reason = l.Reason,
                Status = l.Status.ToString(),
                AdminRemarks = l.AdminRemarks
            };
        }).ToList();
    }
}