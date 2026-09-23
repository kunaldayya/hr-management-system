using HR.Application.Common.Interfaces;
using HR.Application.Features.Leaves.Queries.Dtos;
using HR.Domain.Entities;
using HR.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System.Security.Claims;

namespace HR.Application.Features.Leaves.Queries.GetMyLeaves;

public class GetMyLeavesQueryHandler : IRequestHandler<GetMyLeavesQuery, List<LeaveRequestDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMyLeavesQueryHandler(
        IMongoContext mongoContext,
        IUserRepository userRepository,
        IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<LeaveRequestDto>> Handle(GetMyLeavesQuery request, CancellationToken cancellationToken)
    {
        var claims = _httpContextAccessor.HttpContext?.User;
        var userId = claims?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? claims?.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");

        // Fetch leave requests for the logged-in user
        var leaves = await leavesCollection
            .Find(l => l.EmployeeId == userId)
            .ToListAsync(cancellationToken);

        // Fetch user profile for the name
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var employeeName = user != null
            ? $"{user.FirstName} {user.LastName}".Trim()
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