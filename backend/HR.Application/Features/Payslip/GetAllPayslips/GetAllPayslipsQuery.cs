using HR.Application.Features.Payslips.Queries.GetMyPayslips;
using MediatR;

namespace HR.Application.Features.Payslips.Queries.GetAllPayslips;

public record GetAllPayslipsQuery : IRequest<List<PayslipDto>>;
