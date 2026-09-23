using HR.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HR.Domain.Entities;
public class Payslip : BaseEntity
{

    public string EmployeeId { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public string GeneratedByAdminId { get; set; } = string.Empty;
}
