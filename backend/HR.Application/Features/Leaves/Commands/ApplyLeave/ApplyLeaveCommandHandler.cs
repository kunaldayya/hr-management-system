using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;

namespace HR.Application.Features.Leaves.Commands.ApplyLeave;

public class ApplyLeaveCommandHandler : IRequestHandler<ApplyLeaveCommand, string>
{
    private readonly IMongoContext _mongoContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ApplyLeaveCommandHandler(IMongoContext mongoContext, IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> Handle(ApplyLeaveCommand request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        // Fixed: Use standard FindFirst().Value fallback if FindFirstValue extension is missing
        var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user?.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");

        var leaveRequest = new LeaveRequest
        {
            EmployeeId = userId,
            LeaveType = request.LeaveType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason,
            Status = Domain.Enums.LeaveStatus.Pending
        };

        await leavesCollection.InsertOneAsync(leaveRequest, cancellationToken: cancellationToken);

        return leaveRequest.Id.ToString();
    }
}