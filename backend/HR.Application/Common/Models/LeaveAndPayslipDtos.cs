using HR.Domain.Enums;

namespace HR.Application.Common.Models;

public record LeaveRequestDto(
    string Id,
    string EmployeeId,
    string EmployeeName,
    LeaveType LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    string Reason,
    LeaveStatus Status,
    string? AdminRemarks
);

public record PayslipDto(
    string Id,
    string EmployeeId,
    string EmployeeName,
    int Month,
    int Year,
    decimal BasicSalary,
    decimal Allowances,
    decimal Deductions,
    decimal NetSalary,
    DateTime CreatedAt
);