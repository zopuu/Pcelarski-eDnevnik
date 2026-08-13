using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace PcelarskiEDnevnik.Modules.Accounts;

public static class AccountsModule {
    public static IServiceCollection AddAccountsModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        return services;
    }

    public static IEndpointRouteBuilder MapAccountsEndpoints(
        this IEndpointRouteBuilder endpoints) {
        return endpoints;
    }
}