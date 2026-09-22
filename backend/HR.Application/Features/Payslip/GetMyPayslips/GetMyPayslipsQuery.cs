using MediatR;

namespace HR.Application.Features.Payslips.Queries.GetMyPayslips;

public record GetMyPayslipsQuery : IRequest<List<PayslipDto>>;