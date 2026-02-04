using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using Serilog;
using System.Text;
using System.Text.Json.Serialization;
using WebApiProject.BLL;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Data;
using WebApiProject.MiddleWare;

var builder = WebApplication.CreateBuilder(args);

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//.AddJwtBearer(options =>
//{
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidateAudience = true,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,

//        ValidIssuer = builder.Configuration["Jwt:Issuer"],
//        ValidAudience = builder.Configuration["Jwt:Audience"],
//        IssuerSigningKey = new SymmetricSecurityKey(
//            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
//        )
//    };
//});

// =======================
// Logging (Console בלבד)
// =======================
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// =======================
// Dependency Injection
// =======================
builder.Services.AddScoped<IDonorDAL, DonorDAL>();
builder.Services.AddScoped<IDonorBLLService, DonorBLLService>();
builder.Services.AddScoped<IGiftDAL, GiftDAL>();
builder.Services.AddScoped<IGiftBLLService, GiftBLLService>();
builder.Services.AddScoped<IShoppingDAL, ShoppingDAL>();
builder.Services.AddScoped<IShoppingBLLService, ShoppingBLLService>();
builder.Services.AddScoped<IUserDAL, UserDAL>();
builder.Services.AddScoped<IUserBLLService, UserBLLService>();
builder.Services.AddScoped<IEmailBLLService, EmailBLLService>();
builder.Services.AddSingleton<RaffleStorageService>();
builder.Services.AddScoped<RafflePdfBLLService>();
builder.Services.AddScoped<GiftBLLService>();

// ⚡ קביעת רישיון QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());


// =======================
// Controllers + Validation
// =======================
builder.Services.AddControllers();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value.Errors.Count > 0)
            .Select(e => new
            {
                Field = e.Key,
                Message = e.Value.Errors.First().ErrorMessage
            });

        return new BadRequestObjectResult(new
        {
            StatusCode = 400,
            Errors = errors
        });
    };
});

// =======================
// Swagger
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token like: Bearer {token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// --- Add CORS policy ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // כתובת ה-Angular
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// =======================
// Database
// =======================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
    //"Data Source=SRV2\\PUPILS;DataBase=project_db;Integrated Security=True;Encrypt=True;Trust Server Certificate=True"
    //"Data Source=SRV2\\PUPILS;DataBase=project_db2;Integrated Security=True;Encrypt=True;Trust Server Certificate=True"
    "Data Source=DESKTOP-1VUANBN;Initial Catalog=WebApiDB;Integrated Security=True;Encrypt=True;Trust Server Certificate=True"
    ));

// =======================
// JWT Authentication
// =======================
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddAuthorization();

// =======================
// Build App
// =======================
var app = builder.Build();

// 3. שימוש ב-CORS
app.UseCors("AllowAngularDev");


// =======================
// Middleware Pipeline
// =======================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =======================
// Global Exception Handler
// =======================
app.ConfigureErrorHandling();  // 1. לוכד הכל
app.UseAuthentication();       // 2. JWT
app.UseAuthorization();        // 3. Roles

app.UseHttpsRedirection();

app.MapControllers();

app.Run();