using HR.Application.Common.Interfaces;
using HR.Application.DTOs;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Attendance.Queries
{
    public record GetTodayStatusQuery(string EmployeeId) : IRequest<TodayStatusDto>;

    public class GetTodayStatusQueryHandler : IRequestHandler<GetTodayStatusQuery, TodayStatusDto>
    {
        private readonly IMongoContext _context;

        public GetTodayStatusQueryHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<TodayStatusDto> Handle(GetTodayStatusQuery request, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // 1. Fetch Today's Attendance Record
            var record = await _context.AttendanceRecords
                .Find(a => a.EmployeeId == request.EmployeeId && a.Date == today)
                .FirstOrDefaultAsync(cancellationToken);

            // 2. Fetch User from _context.Users
            var user = await _context.Users
                .Find(u => u.Id == request.EmployeeId)
                .FirstOrDefaultAsync(cancellationToken);

            var employeeName = user != null
                ? $"{user.FirstName} {user.LastName}".Trim()
                : "Unknown Employee";

            // 3. Extract Record Id
            Guid? recordId = record != null ? record.Id : null;

            // 4. Calculate clocked-in status flag
            bool isClockedIn = record?.ClockInTime != null && record?.ClockOutTime == null;

            // 5. Return TodayStatusDto
            return new TodayStatusDto(
                recordId,
                request.EmployeeId,
                employeeName,
                today,
                record?.ClockInTime,
                record?.ClockOutTime,
                record?.TotalHours.HasValue == true ? (decimal?)Convert.ToDecimal(record.TotalHours.Value) : null,
                record?.Status,
                isClockedIn
            );
        }
    }
}