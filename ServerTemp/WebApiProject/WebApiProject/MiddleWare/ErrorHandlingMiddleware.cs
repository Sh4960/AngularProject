using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace WebApiProject.MiddleWare
{
    public static class ErrorHandlingMiddleware
    {
        public static void ConfigureErrorHandling(this IApplicationBuilder app)
        {
            app.UseExceptionHandler(appError =>
            {
                appError.Run(async context =>
                {
                    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
                    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

                    int statusCode = 500;
                    string message = "An unexpected error occurred.";

                    switch (exception)
                    {
                        case InvalidOperationException ioe:
                            statusCode = 400;
                            message = ioe.Message;
                            break;
                        case KeyNotFoundException knf:
                            statusCode = 404;
                            message = knf.Message;
                            break;
                    }

                    logger.LogError(exception, "Error occurred");

                    context.Response.StatusCode = statusCode;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        Message = message
                    });
                });
            });
        }
    }
}
