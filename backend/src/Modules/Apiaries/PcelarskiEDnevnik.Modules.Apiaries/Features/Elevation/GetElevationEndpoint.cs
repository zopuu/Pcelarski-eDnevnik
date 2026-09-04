using System.Globalization;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Elevation;

public sealed record ElevationResponse(
    double ElevationMeters);

public static class GetElevationEndpoint {
    public static IEndpointRouteBuilder MapGetElevationEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/elevation",
            async (
                double latitude,
                double longitude,
                IHttpClientFactory httpClientFactory,
                CancellationToken cancellationToken) => {
                if (
                    !double.IsFinite(latitude) ||
                    latitude is < -90 or > 90) {
                    return Results.BadRequest();
                }

                if (
                    !double.IsFinite(longitude) ||
                    longitude is < -180 or > 180) {
                    return Results.BadRequest();
                }

                var client =
                    httpClientFactory.CreateClient(
                        OpenTopoDataClient.HttpClientName);

                var location =
                    string.Create(
                        CultureInfo.InvariantCulture,
                        $"{latitude},{longitude}");

                try {
                    var response =
                        await client.GetFromJsonAsync<
                            OpenTopoDataResponse>(
                            $"v1/aster30m?locations={location}",
                            cancellationToken);

                    var elevation =
                        response?.Results
                            ?.FirstOrDefault()
                            ?.Elevation;

                    if (elevation is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        new ElevationResponse(
                            elevation.Value));
                }
                catch (HttpRequestException) {
                    return Results.Problem(
                        statusCode:
                            StatusCodes
                                .Status502BadGateway,
                        title:
                            "Elevation service unavailable.",
                        extensions:
                            new Dictionary<string, object?> {
                                ["code"] =
                                    "apiaries.elevation_service_unavailable",
                            });
                }
                catch (OperationCanceledException)
                    when (!cancellationToken.IsCancellationRequested) {
                    return Results.Problem(
                        statusCode:
                            StatusCodes
                                .Status504GatewayTimeout,
                        title:
                            "Elevation service timed out.",
                        extensions:
                            new Dictionary<string, object?> {
                                ["code"] =
                                    "apiaries.elevation_service_timed_out",
                            });
                }
            });

        return endpoints;
    }
}

internal static class OpenTopoDataClient {
    internal const string HttpClientName =
        "OpenTopoData";
}

public sealed record OpenTopoDataResponse(
    IReadOnlyList<OpenTopoDataResult>? Results);

public sealed record OpenTopoDataResult(
    double? Elevation);
