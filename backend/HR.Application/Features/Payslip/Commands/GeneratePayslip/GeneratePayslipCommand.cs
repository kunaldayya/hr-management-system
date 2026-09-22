using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System.Security.Claims;
using DomainPayslip = HR.Domain.Entities.Payslip;

namespace HR.Application.Features.Payslip.GeneratePayslip;

public class GeneratePayslipCommandHandler : IRequestHandler<GeneratePayslipCommand, string>
{
    private readonly IMongoContext _mongoContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GeneratePayslipCommandHandler(IMongoContext mongoContext, IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> Handle(GeneratePayslipCommand request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        // Retrieve Admin / Sub claim safely
        var adminId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? user?.FindFirst("sub")?.Value
                   ?? "System";

        var payslipsCollection = _mongoContext.GetCollection<DomainPayslip>("Payslips");

        var netSalary = (request.BasicSalary + request.Allowances) - request.Deductions;

        var payslip = new DomainPayslip
        {
            EmployeeId = request.EmployeeId,
            Month = request.Month,
            Year = request.Year,
            BasicSalary = request.BasicSalary,
            Allowances = request.Allowances,
            Deductions = request.Deductions,
            NetSalary = netSalary,
            GeneratedByAdminId = adminId
        };

        await payslipsCollection.InsertOneAsync(payslip, cancellationToken: cancellationToken);

        // Safely return string representation of the ID
        return payslip.Id.ToString();
    }
}