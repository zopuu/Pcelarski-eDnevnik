using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.Modules.Identity.Web.Models;

namespace PcelarskiEDnevnik.Modules.Identity.Web.Controllers;

[AllowAnonymous]
public sealed class AccountController : Controller {
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public AccountController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager) {
        _signInManager = signInManager;
        _userManager = userManager;
    }

    [HttpGet("~/account/login")]
    public IActionResult Login(string? returnUrl = null) {
        return View(new LoginViewModel {
            ReturnUrl = returnUrl
        });
    }

    [HttpPost("~/account/login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model) {
        if (!ModelState.IsValid) {
            return View(model);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user is null) {
            ModelState.AddModelError(
                string.Empty,
                "Invalid email or password.");

            return View(model);
        }

        var result = await _signInManager.PasswordSignInAsync(
            user,
            model.Password,
            model.RememberMe,
            lockoutOnFailure: true);

        if (!result.Succeeded) {
            ModelState.AddModelError(
                string.Empty,
                "Invalid email or password.");

            return View(model);
        }

        if (!string.IsNullOrWhiteSpace(model.ReturnUrl) &&
            Url.IsLocalUrl(model.ReturnUrl)) {
            return LocalRedirect(model.ReturnUrl);
        }

        return Redirect("/");
    }
}