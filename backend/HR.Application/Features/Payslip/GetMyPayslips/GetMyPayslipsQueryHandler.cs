using HR.Application.Common.Interfaces;
using HR.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System.Security.Claims;

namespace HR.Application.Features.Payslips.Queries.GetMyPayslips;

public class GetMyPayslipsQueryHandler : IRequestHandler<GetMyPayslipsQuery, List<PayslipDto>>
{
    private readonly IMongoContext _mongoContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMyPayslipsQueryHandler(IMongoContext mongoContext, IHttpContextAccessor httpContextAccessor)
    {
        _mongoContext = mongoContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<PayslipDto>> Handle(GetMyPayslipsQuery request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user?.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var payslipsCollection = _mongoContext.GetCollection<HR.Domain.Entities.Payslip>("Payslips");

        var payslips = await payslipsCollection
            .Find(x => x.EmployeeId == userId)
            .ToListAsync(cancellationToken);

        return payslips.Select(p => new PayslipDto
        {
            Id = p.Id,
            EmployeeId = p.EmployeeId,
            Month = p.Month,
            Year = p.Year,
            BasicSalary = p.BasicSalary,
            Allowances = p.Allowances,
            Deductions = p.Deductions,
            NetSalary = p.NetSalary,
            GeneratedByAdminId = p.GeneratedByAdminId,
            CreatedAt = p.CreatedAt
        }).ToList();
    }
}