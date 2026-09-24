using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Attendance.Commands
{
    public record ManualOverrideCommand(
        Guid RecordId,
        DateTimeOffset ClockInTime,
        DateTimeOffset? ClockOutTime,
        AttendanceStatus Status,
        string OverrideReason,
        string AdminId
    ) : IRequest<Unit>;

    public class ManualOverrideCommandHandler : IRequestHandler<ManualOverrideCommand, Unit>
    {
        private readonly IMongoContext _context;

        public ManualOverrideCommandHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(ManualOverrideCommand request, CancellationToken cancellationToken)
        {
            var collection = _context.AttendanceRecords;

            var record = await collection
                .Find(a => a.Id == request.RecordId)
                .FirstOrDefaultAsync(cancellationToken);

            if (record == null)
            {
                throw new KeyNotFoundException($"Attendance record with ID {request.RecordId} was not found.");
            }

            record.ClockInTime = request.ClockInTime;
            record.ClockOutTime = request.ClockOutTime;
            record.Status = request.Status;

            if (request.ClockOutTime.HasValue)
            {
                var duration = request.ClockOutTime.Value - request.ClockInTime;
                record.TotalHours = Math.Round((decimal)duration.TotalHours, 2);
            }
            else
            {
                record.TotalHours = null;
            }

            record.Notes = $"ADMIN OVERRIDE ({request.AdminId}): {request.OverrideReason}";
            record.UpdatedAt = DateTimeOffset.UtcNow;

            await collection.ReplaceOneAsync(
                r => r.Id == record.Id,
                record,
                cancellationToken: cancellationToken
            );

            return Unit.Value;
        }
    }
}