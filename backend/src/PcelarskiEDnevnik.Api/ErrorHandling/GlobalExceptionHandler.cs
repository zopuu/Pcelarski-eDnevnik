using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Api.ErrorHandling;

internal sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler {
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken) {
        var problemDetails =
            exception switch {
                ConflictException conflict =>
                    CreateConflictProblem(
                        httpContext,
                        conflict),

                _ =>
                    CreateInternalServerProblem(
                        httpContext)
            };

        if (problemDetails.Status ==
            StatusCodes.Status500InternalServerError) {
            logger.LogError(
                exception,
                "Unhandled exception while processing {Method} {Path}. TraceId: {TraceId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);
        }

        httpContext.Response.StatusCode =
            problemDetails.Status!.Value;

        var problemDetailsService =
            httpContext.RequestServices
                .GetRequiredService<IProblemDetailsService>();

        await problemDetailsService.WriteAsync(
            new ProblemDetailsContext {
                HttpContext = httpContext,
                ProblemDetails = problemDetails,
                Exception = exception
            });

        return true;
    }

    private static ProblemDetails CreateConflictProblem(
        HttpContext context,
        ConflictException exception) {
        var problem = new ProblemDetails {
            Status = StatusCodes.Status409Conflict,
            Title = "Conflict",
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        problem.Extensions["code"] =
            exception.Code;

        return problem;
    }

    private static ProblemDetails CreateInternalServerProblem(
        HttpContext context) {
        var problem = new ProblemDetails {
            Status =
                StatusCodes.Status500InternalServerError,

            Title = "An unexpected error occurred.",

            Detail =
                "The server could not complete the request.",

            Instance = context.Request.Path
        };

        problem.Extensions["code"] =
            "server.unexpected_error";

        return problem;
    }
}