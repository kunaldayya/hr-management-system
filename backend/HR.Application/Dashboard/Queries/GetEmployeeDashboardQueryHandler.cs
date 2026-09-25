using HR.Application.Common.Interfaces;
using HR.Application.Features.Dashboard.DTOs;
using HR.Application.Features.Dashboard.Queries;
using HR.Domain.Entities;
// Assuming HR.Domain.Enums contains LeaveStatus based on your code
// using HR.Domain.Enums; 
using MediatR;
using MongoDB.Driver;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HR.Application.Features.Dashboard.Handlers
{
    public class GetEmployeeDashboardQueryHandler : IRequestHandler<GetEmployeeDashboardQuery, EmployeeDashboardVm>
    {
        private readonly IMongoContext _context;

        public GetEmployeeDashboardQueryHandler(IMongoContext context)
        {
            _context = context;
        }

        public async Task<EmployeeDashboardVm> Handle(GetEmployeeDashboardQuery request, CancellationToken cancellationToken)
        {
            // 1. Employee Settings (Configurable per employee if needed)
            decimal dailyTargetHours = 8.5m;
            string shiftTimings = "09:00 AM - 06:00 PM";
            int workDaysPerWeek = 5;

            // 2. Calculate dynamic targets based on the requested calendar month
            var currentYear = request.LocalToday.Year;
            var currentMonth = request.LocalToday.Month;
            int monthlyWorkingDays = GetWorkingDaysInMonth(currentYear, currentMonth);

            decimal monthlyTargetHours = monthlyWorkingDays * dailyTargetHours;
            decimal weeklyTargetHours = workDaysPerWeek * dailyTargetHours;

            // 3. Fetch data directly from MongoDB Context
            var thirtyDaysAgo = request.LocalToday.AddDays(-30);

            var attendanceFilter = Builders<AttendanceRecord>.Filter.And(
                Builders<AttendanceRecord>.Filter.Eq(a => a.EmployeeId, request.EmployeeId),
                Builders<AttendanceRecord>.Filter.Gte(a => a.Date, thirtyDaysAgo),
                Builders<AttendanceRecord>.Filter.Lte(a => a.Date, request.LocalToday)
            );

            var leaveFilter = Builders<LeaveRequest>.Filter.Eq(l => l.EmployeeId, request.EmployeeId);

            var attendanceTask = _context.AttendanceRecords.Find(attendanceFilter).ToListAsync(cancellationToken);
            var leaveTask = _context.GetCollection<LeaveRequest>("LeaveRequests").Find(leaveFilter).ToListAsync(cancellationToken);

            await Task.WhenAll(attendanceTask, leaveTask);

            var attendanceRecords = await attendanceTask;
            var leaves = await leaveTask;

            // 4. Calculate Stats & Counters
            int presence = 0, absent = 0, onTime = 0, late = 0;
            decimal totalHoursWorked = 0m;
            decimal currentMonthHoursWorked = 0m;

            foreach (var record in attendanceRecords)
            {
                if (record.Status == AttendanceStatus.PRESENT || record.Status == AttendanceStatus.LATE) presence++;
                if (record.Status == AttendanceStatus.ABSENT) absent++;
                if (record.Status == AttendanceStatus.PRESENT) onTime++;
                if (record.Status == AttendanceStatus.LATE) late++;

                decimal recordHours = record.TotalHours ?? 0m;
                totalHoursWorked += recordHours;

                if (record.Date.Year == currentYear && record.Date.Month == currentMonth)
                {
                    currentMonthHoursWorked += recordHours;
                }
            }

            // Assuming LeaveStatus enum contains 'Approved'. Adjust string mapping if enum is different.
            var approvedLeavesCount = leaves.Count(l => l.Status.ToString().Equals("Approved", StringComparison.OrdinalIgnoreCase));

            // 5. Today's Shift
            var todayRecord = attendanceRecords.FirstOrDefault(r => r.Date == request.LocalToday)
                              ?? attendanceRecords.OrderByDescending(r => r.Date).FirstOrDefault();

            var todayShift = new TodayShiftDto(
                ClockInTime: todayRecord?.ClockInTime,
                ClockOutTime: todayRecord?.ClockOutTime,
                Status: todayRecord?.Status.ToString() ?? "N/A",
                ShiftTimings: shiftTimings
            );

            // 6. Working Hours Chart (Last 7 Days)
            var last7Records = attendanceRecords.OrderByDescending(r => r.Date).Take(7).Reverse().ToList();
            var weekHours = last7Records.Sum(r => r.TotalHours ?? 0m);

            var chartData = last7Records.Select(r => new WorkingHoursChartDto(
                Day: r.Date.ToString("ddd"), // E.g., "Mon", "Tue"
                Hours: r.TotalHours ?? 0m,
                IsShort: (r.TotalHours ?? 0m) < dailyTargetHours
            )).ToList();

            // 7. Hours Completion Progress
            var monthProgress = monthlyTargetHours > 0
                ? Math.Min(100, (int)Math.Round((currentMonthHoursWorked / monthlyTargetHours) * 100))
                : 0;

            var weekProgress = weeklyTargetHours > 0
                ? Math.Min(100, (int)Math.Round((weekHours / weeklyTargetHours) * 100))
                : 0;

            var daysAttendedPercentage = monthlyWorkingDays > 0
                ? (int)Math.Round(((decimal)presence / monthlyWorkingDays) * 100)
                : 0;

            var hoursCompletion = new HoursCompletionDto(
                WeekHours: weekHours,
                WeeklyTargetHours: weeklyTargetHours,
                WeekProgressPercentage: weekProgress,
                MonthHours: currentMonthHoursWorked,
                MonthlyTargetHours: monthlyTargetHours,
                MonthProgressPercentage: monthProgress,
                DaysAttended: presence,
                TotalWorkingDays: monthlyWorkingDays,
                DaysAttendedPercentage: daysAttendedPercentage
            );

            // 8. Leave History (Top 3 recent by StartDate)
            var leaveHistory = leaves.OrderByDescending(l => l.StartDate).Take(3).Select(l => new LeaveHistoryDto(
                Id: l.Id,
                LeaveType: l.LeaveType.ToString(),
                Status: l.Status.ToString(),
                Reason: l.Reason,
                StartDate: l.StartDate,
                EndDate: l.EndDate
            )).ToList();

            // 9. Attendance Log (30 Days)
            var attendanceLog = attendanceRecords.OrderByDescending(r => r.Date).Select(r => new AttendanceLogDto(
                Id: r.Id,
                Date: r.Date,
                Status: r.Status.ToString(),
                ClockInTime: r.ClockInTime,
                ClockOutTime: r.ClockOutTime
            )).ToList();

            // 10. Construct final ViewModel
            return new EmployeeDashboardVm(
                TodayShift: todayShift,
                HoursCompletion: hoursCompletion,
                Counters: new CountersDto(presence, absent, approvedLeavesCount, onTime, late),
                WorkingHoursChart: chartData,
                LeaveHistory: leaveHistory,
                AttendanceLog: attendanceLog
            );
        }

        private int GetWorkingDaysInMonth(int year, int month)
        {
            int daysInMonth = DateTime.DaysInMonth(year, month);
            int workingDays = 0;

            for (int i = 1; i <= daysInMonth; i++)
            {
                DateTime date = new DateTime(year, month, i);
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    workingDays++;
                }
            }

            return workingDays;
        }
    }
}