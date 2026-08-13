using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace PcelarskiEDnevnik.Modules.Identity.Web;

public static class IdentityWebModule {
    public static IServiceCollection AddIdentityWebModule(
        this IServiceCollection services) {
        services
            .AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddIdentityCookies();

        services.ConfigureApplicationCookie(options => {
            options.LoginPath = "/account/login";

            options.Cookie.Name =
                "__Host-PcelarskiEDnevnik.Identity";

            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy =
                CookieSecurePolicy.Always;

            options.Cookie.SameSite =
                SameSiteMode.Lax;

            options.ExpireTimeSpan =
                TimeSpan.FromHours(8);

            options.SlidingExpiration = true;
        });

        services
            .AddControllersWithViews()
            .AddApplicationPart(
                typeof(IdentityWebModule).Assembly);

        return services;
    }
}