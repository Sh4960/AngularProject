namespace WebApiProject.MiddleWare
{
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

public class MyCustomMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<MyCustomMiddleware> _logger;

        public MyCustomMiddleware(RequestDelegate next, ILogger<MyCustomMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // פעולה לפני העברת הבקשה הלאה
            _logger.LogInformation($"Request path: {context.Request.Path}");

            // העברת הבקשה למידלוור הבא ב-pipeline
            await _next(context);

            // פעולה אחרי
            _logger.LogInformation("Response sent");
        }
    }

}

