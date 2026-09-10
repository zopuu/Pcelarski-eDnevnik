namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

internal static class HoneyDomainGuards {
    public static void AgainstEmptyGuid(
        Guid value,
        string parameterName) {
        if (value == Guid.Empty) {
            throw new ArgumentException(
                "Value cannot be an empty GUID.",
                parameterName);
        }
    }

    public static string RequiredText(
        string value,
        int maximumLength,
        string parameterName) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException(
                "Value is required.",
                parameterName);
        }

        var normalized = value.Trim();

        if (normalized.Length > maximumLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maximumLength} characters.",
                parameterName);
        }

        return normalized;
    }

    public static string? OptionalText(
        string? value,
        int maximumLength,
        string parameterName) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        var normalized = value.Trim();

        if (normalized.Length > maximumLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maximumLength} characters.",
                parameterName);
        }

        return normalized;
    }

    public static decimal PositiveAmount(
        decimal value,
        string parameterName) {
        if (value <= 0) {
            throw new ArgumentOutOfRangeException(
                parameterName,
                value,
                "Amount must be greater than zero.");
        }

        return value;
    }

    public static int PositiveInt(
        int value,
        string parameterName) {
        if (value <= 0) {
            throw new ArgumentOutOfRangeException(
                parameterName,
                value,
                "Value must be greater than zero.");
        }

        return value;
    }

    public static int Percentage(
        int value,
        string parameterName) {
        if (value is <
                HoneyHarvestRules.MinimumPercentage
            or >
                HoneyHarvestRules.MaximumPercentage) {
            throw new ArgumentOutOfRangeException(
                parameterName,
                value,
                "Percentage must be between 0 and 100.");
        }

        return value;
    }

    public static void ValidPeriod(
        DateOnly startedOn,
        DateOnly endedOn) {
        if (endedOn < startedOn) {
            throw new ArgumentException(
                "Period end cannot be before period start.");
        }
    }

    public static string Unit(
        string value,
        string parameterName) {
        return RequiredText(
                value,
                HoneyHarvestRules.UnitMaxLength,
                parameterName)
            .ToLowerInvariant();
    }
}