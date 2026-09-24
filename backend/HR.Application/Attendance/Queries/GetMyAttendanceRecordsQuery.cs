using HR.Application.Common.Interfaces;
using HR.Application.DTOs;
using HR.Domain.Entities;
using MediatR;
using MongoDB.Driver;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Attendance.Queries
{
    public record GetMyAttendanceRecordsQuery(
        string EmployeeId,
        int Month = 0,
        int Year = 0,
        int PageIndex = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<TodayStatusDto>>;

    public class GetMyAttendanceRecordsQueryHandler
        : IRequestHandler<GetMyAttendanceRecordsQuery, PagedResponse<TodayStatusDto>>
    {
        private readonly IMongoContext _context;

        public GetMyAttendanceRecordsQueryHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<TodayStatusDto>> Handle(
            GetMyAttendanceRecordsQuery request,
            CancellationToken cancellationToken)
        {
            var collection = _context.AttendanceRecords;
            var builder = Builders<AttendanceRecord>.Filter;
            var filter = builder.Eq(a => a.EmployeeId, request.EmployeeId);

            if (request.Month > 0)
            {
                var startDate = new DateOnly(request.Year > 0 ? request.Year : DateTime.UtcNow.Year, request.Month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);
                filter &= builder.Gte(a => a.Date, startDate) & builder.Lte(a => a.Date, endDate);
            }
            else if (request.Year > 0)
            {
                var startDate = new DateOnly(request.Year, 1, 1);
                var endDate = new DateOnly(request.Year, 12, 31);
                filter &= builder.Gte(a => a.Date, startDate) & builder.Lte(a => a.Date, endDate);
            }

            var totalCount = (int)await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

            var items = await collection
                .Find(filter)
                .SortByDescending(a => a.Date)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Limit(request.PageSize)
                .ToListAsync(cancellationToken);

            // Fetch user record
            var user = await _context.Users
                .Find(u => u.Id == request.EmployeeId)
                .FirstOrDefaultAsync(cancellationToken);

            var fullName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;
            var employeeName = !string.IsNullOrWhiteSpace(fullName) ? fullName : request.EmployeeId;

            var dtos = items.Select(record => new TodayStatusDto(
                record.Id,
                record.EmployeeId,
                employeeName,
                record.Date,
                record.ClockInTime,
                record.ClockOutTime,
                record.TotalHours,
                record.Status,
                record.ClockInTime.HasValue && !record.ClockOutTime.HasValue
            ));

            return new PagedResponse<TodayStatusDto>(dtos, totalCount, request.PageIndex, request.PageSize);
        }
    }
}