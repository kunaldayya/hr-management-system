using HR.Application;
using HR.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

const string AllowFrontendOrigin = "_allowFrontendOrigin";

// 1. Register CORS service
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontendOrigin, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:3000" 
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(AllowFrontendOrigin);

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();