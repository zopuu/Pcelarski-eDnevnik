using PcelarskiEDnevnik.Api.Authentication;
using PcelarskiEDnevnik.Api.OpenApi;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.Api.ErrorHandling;
using PcelarskiEDnevnik.Api.Storage;
using PcelarskiEDnevnik.SharedKernel.Storage;

namespace PcelarskiEDnevnik.Api.Composition;

internal static class ApiServiceRegistration {
    public const string FrontendCorsPolicy = "Frontend";

    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration) {
        services.AddProblemDetails(options => {
            options.CustomizeProblemDetails = context => {
                context.ProblemDetails.Extensions["traceId"] =
                    context.HttpContext.TraceIdentifier;
            };
        });
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddOpenApi(options => {
            options.AddDocumentTransformer<
                OAuthSecuritySchemeTransformer>();

            options.AddOperationTransformer<
                OAuthSecurityRequirementTransformer>();
        });

        services.AddHealthChecks();

        services.AddAuthorization();
        services.AddDataProtection();
        services.AddValidation();
        services.AddHttpContextAccessor();
        services.AddSingleton<IImageStorage, LocalImageStorage>();

        services.AddScoped<
            ICurrentUserContext,
            HttpCurrentUserContext>();

        var frontendOrigins =
            configuration
                .GetSection("Frontend:AllowedOrigins")
                .Get<string[]>()
            ?? [];

        services.AddCors(options => {
            options.AddPolicy(
                FrontendCorsPolicy,
                policy => {
                    policy
                        .WithOrigins(frontendOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });

        return services;
    }
}
