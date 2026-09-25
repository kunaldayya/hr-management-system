using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Enums;
using MediatR;
using MongoDB.Bson;
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

        // Ensure string is a valid 24-character hexadecimal ObjectId
        if (!ObjectId.TryParse(request.LeaveId, out var objectId))
        {
            return false;
        }

        // Filter using the parsed ObjectId
        var filter = Builders<LeaveRequest>.Filter.Eq("_id", objectId);

        var update = Builders<LeaveRequest>.Update
            .Set(l => l.Status, LeaveStatus.Approved)
            .Set(l => l.AdminRemarks, request.AdminRemarks);

        var result = await leavesCollection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

        return result.MatchedCount > 0;
    }
}