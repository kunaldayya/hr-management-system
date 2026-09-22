namespace HR.Application.Features.Payslips.Queries.GetMyPayslips;

public class PayslipDto
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public string GeneratedByAdminId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}