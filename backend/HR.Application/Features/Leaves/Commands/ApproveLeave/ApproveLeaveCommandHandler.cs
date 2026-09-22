using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Enums;
using MediatR;
using MongoDB.Driver;

namespace HR.Application.Features.Leaves.Commands.ApproveLeave;

public class ApproveLeaveCommandHandler : IRequestHandler<ApproveLeaveCommand, bool>
{
    private readonly IMongoContext _mongoContext;

    public ApproveLeaveCommandHandler(IMongoContext mongoContext)
    {
        _mongoContext = mongoContext;
    }

    public async Task<bool> Handle(ApproveLeaveCommand request, CancellationToken cancellationToken)
    {
        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");

        // Define filter to locate the specific leave request by ID
        var filter = Builders<LeaveRequest>.Filter.Eq(l => l.Id, request.LeaveId);

        // Define update definition for Status and AdminRemarks
        var update = Builders<LeaveRequest>.Update
            .Set(l => l.Status, LeaveStatus.Approved)
            .Set(l => l.AdminRemarks, request.AdminRemarks);

        // Execute update directly in MongoDB
        var result = await leavesCollection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

        // Returns true if a matching document was found and updated
        return result.MatchedCount > 0;
    }
}