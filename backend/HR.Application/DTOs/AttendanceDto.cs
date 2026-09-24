using System;
using HR.Domain.Entities;

namespace HR.Application.DTOs
{
    public record TodayStatusDto(
        Guid? Id,
        string EmployeeId,
        string EmployeeName,
        DateOnly Date,
        DateTimeOffset? ClockInTime,
        DateTimeOffset? ClockOutTime,
        decimal? TotalHours,
        AttendanceStatus? Status,
        bool IsClockedIn
     );

    public record ClockInRequestDto(string? Notes);
    public record ClockOutRequestDto(string? Notes);

    public record ManualOverrideRequestDto(
        DateTimeOffset ClockInTime,
        DateTimeOffset? ClockOutTime,
        AttendanceStatus Status,
        string OverrideReason
    );

    public record AttendanceMetricsDto(
        int TotalEmployees,
        int PresentToday,
        int LateToday,
        int AbsentToday
    );

    public record PagedResponse<T>(
        IEnumerable<T> Items,
        int TotalCount,
        int PageIndex,
        int PageSize
    );

    public record AdminAttendanceOverviewDto(
        AttendanceMetricsDto Metrics,
        PagedResponse<TodayStatusDto> Records
    );
}