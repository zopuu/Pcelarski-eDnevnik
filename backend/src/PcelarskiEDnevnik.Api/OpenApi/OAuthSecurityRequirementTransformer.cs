using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace PcelarskiEDnevnik.Api.OpenApi;

internal sealed class OAuthSecurityRequirementTransformer
    : IOpenApiOperationTransformer {
    public Task TransformAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken) {
        var metadata =
            context.Description
                .ActionDescriptor
                .EndpointMetadata;

        var allowsAnonymous =
            metadata
                .OfType<IAllowAnonymous>()
                .Any();

        if (allowsAnonymous) {
            return Task.CompletedTask;
        }

        var requiresAuthorization =
            metadata
                .OfType<IAuthorizeData>()
                .Any();

        if (!requiresAuthorization) {
            return Task.CompletedTask;
        }

        operation.Security ??= [];

        operation.Security.Add(
            new OpenApiSecurityRequirement {
                [
                    new OpenApiSecuritySchemeReference(
                        "oauth2",
                        context.Document!)
                ] =
                [
                    "pcelarski_api"
                ]
            });

        return Task.CompletedTask;
    }
}