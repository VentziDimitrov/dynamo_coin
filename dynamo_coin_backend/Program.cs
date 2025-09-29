using Serilog;

var builder = WebApplication.CreateBuilder(args);

// --- Serilog to file + console ---
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// --- Services & DI ---
builder.Services.AddHttpClient(); // used by our services
builder.Services.AddScoped<ICoinLoreService, CoinLoreService>();
builder.Services.AddScoped<IOpenAiService, OpenAiService>();

builder.Services.AddControllers();

// Allow Vite dev server origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5260", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();
