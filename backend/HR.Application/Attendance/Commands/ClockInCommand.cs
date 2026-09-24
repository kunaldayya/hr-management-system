using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Attendance.Commands
{
    // Return a primitive ID or Response DTO instead of returning the raw Domain Entity in CQRS
    public record ClockInCommand(string EmployeeId, string? Notes, string? IpAddress) : IRequest<Guid>;

    public class ClockInCommandHandler : IRequestHandler<ClockInCommand, Guid>
    {
        private readonly IMongoContext _context;
        private static readonly TimeSpan ShiftStartTime = new(9, 0, 0);
        private static readonly TimeSpan GracePeriod = TimeSpan.FromMinutes(15);

        public ClockInCommandHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(ClockInCommand request, CancellationToken cancellationToken)
        {
            var collection = _context.AttendanceRecords;
            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(now.UtcDateTime);

            // FIX 1: Use MongoDB's .Find() + .FirstOrDefaultAsync()
            var existingRecord = await collection
                .Find(a => a.EmployeeId == request.EmployeeId && a.Date == today)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingRecord?.ClockInTime != null)
            {
                throw new InvalidOperationException("Employee has already clocked in for today");
            }

            var currentTimeOfDay = now.TimeOfDay;
            var isLate = currentTimeOfDay > (ShiftStartTime + GracePeriod);

            var record = existingRecord ?? new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                EmployeeId = request.EmployeeId,
                Date = today,
                CreatedAt = now
            };

            record.ClockInTime = now;
            record.Status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
            record.Notes = request.Notes;
            record.IpAddress = request.IpAddress;
            record.UpdatedAt = now;

            // FIX 2 & 3: Use MongoDB write methods directly instead of .Add() and .SaveChangesAsync()
            if (existingRecord == null)
            {
                await collection.InsertOneAsync(record, cancellationToken: cancellationToken);
            }
            else
            {
                await collection.ReplaceOneAsync(
                    r => r.Id == record.Id,
                    record,
                    cancellationToken: cancellationToken 
                );
            }

            return record.Id;
        }
    }
}