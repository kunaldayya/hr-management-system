using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;
using MongoDB.Driver;
using HR.Application.Features.Leaves.Queries.Dtos;

namespace HR.Application.Features.Leaves.Queries.GetAllLeaves;

public class GetAllLeavesQueryHandler : IRequestHandler<GetAllLeavesQuery, List<LeaveRequestDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IUserRepository _userRepository;

    public GetAllLeavesQueryHandler(IMongoContext mongoContext, IUserRepository userRepository)
    {
        _mongoContext = mongoContext;
        _userRepository = userRepository;
    }

    public async Task<List<LeaveRequestDto>> Handle(GetAllLeavesQuery request, CancellationToken cancellationToken)
    {
        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");

        // Fetch all leave requests sorted by StartDate descending
        var leaves = await leavesCollection
            .Find(FilterDefinition<LeaveRequest>.Empty)
            .SortByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);

        // Collect unique employee IDs from the leave requests
        var employeeIds = leaves
            .Select(l => l.EmployeeId?.ToString())
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        // Fetch all user records for those IDs from the unified users collection
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var userMap = users
            .Where(u => employeeIds.Contains(u.Id))
            .ToDictionary(u => u.Id, u => u);

        return leaves.Select(l =>
        {
            var empIdStr = l.EmployeeId?.ToString() ?? string.Empty;
            userMap.TryGetValue(empIdStr, out var user);

            return new LeaveRequestDto
            {
                Id = l.Id.ToString(),
                EmployeeId = empIdStr,
                EmployeeName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Unknown User",
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