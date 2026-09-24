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
    public record GetAdminAttendanceOverviewQuery(
        DateOnly? Date,
        int PageIndex = 1,
        int PageSize = 10
    ) : IRequest<AdminAttendanceOverviewDto>;

    public class GetAdminAttendanceOverviewQueryHandler
        : IRequestHandler<GetAdminAttendanceOverviewQuery, AdminAttendanceOverviewDto>
    {
        private readonly IMongoContext _context;

        public GetAdminAttendanceOverviewQueryHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<AdminAttendanceOverviewDto> Handle(
            GetAdminAttendanceOverviewQuery request,
            CancellationToken cancellationToken)
        {
            var collection = _context.AttendanceRecords;
            var targetDate = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);

            var filter = Builders<AttendanceRecord>.Filter.Eq(a => a.Date, targetDate);

            var totalCount = (int)await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

            var present = (int)await collection.CountDocumentsAsync(
                filter & Builders<AttendanceRecord>.Filter.Eq(a => a.Status, AttendanceStatus.PRESENT),
                cancellationToken: cancellationToken);

            var late = (int)await collection.CountDocumentsAsync(
                filter & Builders<AttendanceRecord>.Filter.Eq(a => a.Status, AttendanceStatus.LATE),
                cancellationToken: cancellationToken);

            var absent = (int)await collection.CountDocumentsAsync(
                filter & Builders<AttendanceRecord>.Filter.Eq(a => a.Status, AttendanceStatus.ABSENT),
                cancellationToken: cancellationToken);

            var records = await collection
                .Find(filter)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Limit(request.PageSize)
                .ToListAsync(cancellationToken);

            // 1. Extract non-null distinct Employee IDs
            var employeeIds = records
                .Where(r => !string.IsNullOrEmpty(r.EmployeeId))
                .Select(r => r.EmployeeId)
                .Distinct()
                .ToList();

            // 2. Fetch employee details matching string IDs
            var userFilter = Builders<User>.Filter.In(u => u.Id, employeeIds);
            var employees = await _context.Users
                .Find(userFilter)
                .ToListAsync(cancellationToken);

            // 3. Case-insensitive dictionary lookup
            var employeeDict = employees.ToDictionary(
                e => e.Id,
                e => $"{e.FirstName} {e.LastName}".Trim(),
                StringComparer.OrdinalIgnoreCase
            );

            // 4. Map to TodayStatusDto
            var dtos = records.Select(record =>
            {
                string resolvedName = "Unknown Employee";

                if (!string.IsNullOrEmpty(record.EmployeeId) && employeeDict.TryGetValue(record.EmployeeId, out var name))
                {
                    resolvedName = string.IsNullOrWhiteSpace(name) ? record.EmployeeId : name;
                }

                return new TodayStatusDto(
                    record.Id,
                    record.EmployeeId,
                    resolvedName,
                    record.Date,
                    record.ClockInTime,
                    record.ClockOutTime,
                    record.TotalHours,
                    record.Status,
                    record.ClockInTime.HasValue && !record.ClockOutTime.HasValue
                );
            });

            var metrics = new AttendanceMetricsDto(totalCount, present, late, absent);
            var pagedResponse = new PagedResponse<TodayStatusDto>(dtos, totalCount, request.PageIndex, request.PageSize);

            return new AdminAttendanceOverviewDto(metrics, pagedResponse);
        }
    }
}