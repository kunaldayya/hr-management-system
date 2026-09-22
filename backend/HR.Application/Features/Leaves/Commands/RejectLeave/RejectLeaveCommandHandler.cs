using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using HR.Domain.Enums;
using MediatR;
using MongoDB.Driver;

namespace HR.Application.Features.Leaves.Commands.RejectLeave;

public class RejectLeaveCommandHandler : IRequestHandler<RejectLeaveCommand, bool>
{
    private readonly IMongoContext _mongoContext;

    public RejectLeaveCommandHandler(IMongoContext mongoContext)
    {
        _mongoContext = mongoContext;
    }

    public async Task<bool> Handle(RejectLeaveCommand request, CancellationToken cancellationToken)
    {
        var leavesCollection = _mongoContext.GetCollection<LeaveRequest>("LeaveRequests");

        var filter = Builders<LeaveRequest>.Filter.Eq(l => l.Id, request.LeaveId);

        var update = Builders<LeaveRequest>.Update
            .Set(l => l.Status, LeaveStatus.Rejected)
            .Set(l => l.AdminRemarks, request.Reason);

        var result = await leavesCollection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

        return result.MatchedCount > 0;
    }
}