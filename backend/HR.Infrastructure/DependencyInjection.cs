using HR.Application.Common.Configurations;
using HR.Application.Common.Interfaces;
using HR.Domain.Interfaces;
using HR.Infrastructure.Authentication;
using HR.Infrastructure.Configurations;
using HR.Infrastructure.Persistence;
using HR.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HR.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // MongoDB Settings & Context
        services.Configure<MongoSettings>(configuration.GetSection(MongoSettings.SectionName));
        services.AddSingleton<IMongoContext, MongoContext>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // JWT Settings & Authentication Services
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}