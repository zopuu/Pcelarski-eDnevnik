using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance;

internal static class HiveMaintenanceRequestValidation {
    public static IEnumerable<ValidationResult>
        ValidateDetails(
            decimal? costAmount,
            string? currencyCode,
            string? serviceProvider,
            string costAmountMemberName,
            string currencyCodeMemberName,
            string serviceProviderMemberName) {
        var hasCurrencyCode =
            !string.IsNullOrWhiteSpace(
                currencyCode);

        if (costAmount.HasValue !=
            hasCurrencyCode) {
            yield return new ValidationResult(
                "Cost amount and currency code must either both be provided or both be omitted.",
                [
                    costAmountMemberName,
                    currencyCodeMemberName
                ]);
        }

        if (costAmount < 0) {
            yield return new ValidationResult(
                "Cost amount cannot be negative.",
                [costAmountMemberName]);
        }

        if (costAmount >
            HiveMaintenanceRules
                .MaximumCostAmount) {
            yield return new ValidationResult(
                $"Cost amount cannot exceed {HiveMaintenanceRules.MaximumCostAmount}.",
                [costAmountMemberName]);
        }

        if (costAmount is not null &&
            !HiveMaintenanceRules
                .HasSupportedCostScale(
                    costAmount.Value)) {
            yield return new ValidationResult(
                $"Cost amount cannot have more than {HiveMaintenanceRules.CostScale} decimal places.",
                [costAmountMemberName]);
        }

        if (hasCurrencyCode) {
            var normalizedCurrencyCode =
                currencyCode!.Trim()
                    .ToUpperInvariant();

            if (!Regex.IsMatch(
                    normalizedCurrencyCode,
                    HiveMaintenanceRules
                        .CurrencyCodePattern,
                    RegexOptions.CultureInvariant)) {
                yield return new ValidationResult(
                    "Currency code must contain exactly three ASCII letters.",
                    [currencyCodeMemberName]);
            }
        }

        if (!string.IsNullOrWhiteSpace(
                serviceProvider) &&
            serviceProvider.Trim().Length >
                HiveMaintenanceRules
                    .ServiceProviderMaxLength) {
            yield return new ValidationResult(
                $"Service provider cannot exceed {HiveMaintenanceRules.ServiceProviderMaxLength} characters.",
                [serviceProviderMemberName]);
        }
    }
}
