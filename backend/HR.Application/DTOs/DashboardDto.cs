using System;
using System.Collections.Generic;

namespace HR.Application.Features.Dashboard.DTOs
{
    public record EmployeeDashboardVm(
        TodayShiftDto TodayShift,
        HoursCompletionDto HoursCompletion,
        CountersDto Counters,
        IEnumerable<WorkingHoursChartDto> WorkingHoursChart,
        IEnumerable<LeaveHistoryDto> LeaveHistory,
        IEnumerable<AttendanceLogDto> AttendanceLog
    );

    public record TodayShiftDto(
        DateTimeOffset? ClockInTime,
        DateTimeOffset? ClockOutTime,
        string Status,
        string ShiftTimings
    );

    public record HoursCompletionDto(
        decimal WeekHours,
        decimal WeeklyTargetHours,
        int WeekProgressPercentage,
        decimal MonthHours,
        decimal MonthlyTargetHours,
        int MonthProgressPercentage,
        int DaysAttended,
        int TotalWorkingDays,
        int DaysAttendedPercentage
    );

    public record CountersDto(
        int Presence,
        int Absent,
        int LeaveTaken,
        int OnTime,
        int Late
    );

    public record WorkingHoursChartDto(
        string Day,
        decimal Hours,
        bool IsShort
    );

    public record LeaveHistoryDto(
        string Id,
        string LeaveType,
        string Status,
        string Reason,
        DateTime StartDate,
        DateTime EndDate
    );

    public record AttendanceLogDto(
        Guid Id,
        DateOnly Date,
        string Status,
        DateTimeOffset? ClockInTime,
        DateTimeOffset? ClockOutTime
    );
}