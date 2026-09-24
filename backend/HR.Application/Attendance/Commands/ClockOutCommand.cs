using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Attendance.Commands
{
    // 1. Return a primitive ID instead of the raw Domain Entity to follow CQRS principles
    public record ClockOutCommand(string EmployeeId, string? Notes) : IRequest<Guid>;

    public class ClockOutCommandHandler : IRequestHandler<ClockOutCommand, Guid>
    {
        private readonly IMongoContext _context;

        public ClockOutCommandHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(ClockOutCommand request, CancellationToken cancellationToken)
        {
            var collection = _context.AttendanceRecords;
            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(now.UtcDateTime);

            // 2. Fetch record using MongoDB .Find() and .FirstOrDefaultAsync()
            var record = await collection
                .Find(a => a.EmployeeId == request.EmployeeId && a.Date == today)
                .FirstOrDefaultAsync(cancellationToken);

            if (record?.ClockInTime == null)
            {
                throw new InvalidOperationException("No active clock-in session found for today.");
            }

            if (record.ClockOutTime.HasValue)
            {
                throw new InvalidOperationException("Employee has already clocked out for today.");
            }

            record.ClockOutTime = now;

            // Calculate hours worked
            var duration = now - record.ClockInTime.Value;
            var hours = (decimal)duration.TotalHours;
            record.TotalHours = Math.Round(hours, 2);

            if (hours < 4.0m)
            {
                record.Status = AttendanceStatus.HALF_DAY;
            }

            if (!string.IsNullOrEmpty(request.Notes))
            {
                record.Notes = string.IsNullOrEmpty(record.Notes)
                    ? request.Notes
                    : $"{record.Notes} | ClockOut: {request.Notes}";
            }

            record.UpdatedAt = now;

            // 3. Update the record using MongoDB's ReplaceOneAsync with the correct parameter name
            await collection.ReplaceOneAsync(
                r => r.Id == record.Id,
                record,
                cancellationToken: cancellationToken
            );

            return record.Id;
        }
    }
}