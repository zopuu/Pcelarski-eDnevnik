using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.Composition;

internal sealed class HoneyBatchCompositionCalculator {
    public CompositionCalculationResult Calculate(
        ResolvedHarvestSourceSet sourceSet,
        IReadOnlyDictionary<Guid, int> framesByHiveSuperStayId) {
        if (framesByHiveSuperStayId.Count == 0) {
            return CompositionCalculationResult.Failure(
                new CompositionCalculationIssue(
                    "composition.no_harvest_sources",
                    "The honey batch does not contain harvest sources.",
                    null,
                    null,
                    null));
        }

        var issues = new List<CompositionCalculationIssue>();

        foreach (var issue in sourceSet.Issues) {
            issues.Add(
                new CompositionCalculationIssue(
                    issue.Code is
                        "harvests.super_source_has_no_apiary_exposure"
                        or "harvests.super_source_has_no_effective_exposure"
                        ? "composition.no_exposure"
                        : "composition.source_resolution_failed",
                    issue.Message,
                    issue.HiveSuperStayId,
                    null,
                    null));
        }

        var resolvedById = sourceSet.Sources.ToDictionary(
            x => x.SuperStay.HiveSuperStayId);

        foreach (var sourceId in framesByHiveSuperStayId.Keys) {
            if (!resolvedById.ContainsKey(sourceId)) {
                issues.Add(
                    new CompositionCalculationIssue(
                        "composition.source_resolution_failed",
                        "A harvested super source could not be resolved from its historical record.",
                        sourceId,
                        null,
                        null));
            }
        }

        if (issues.Count > 0) {
            return CompositionCalculationResult.Failure(issues);
        }

        var scores = new Dictionary<string, decimal>(
            StringComparer.OrdinalIgnoreCase);

        foreach (var source in resolvedById.Values) {
            if (source.EffectiveExposureSegments.Count == 0) {
                issues.Add(
                    new CompositionCalculationIssue(
                        "composition.no_exposure",
                        "No meaningful historical exposure could be determined for a harvested source.",
                        source.SuperStay.HiveSuperStayId,
                        null,
                        null));
                continue;
            }

            var harvestedFrames = framesByHiveSuperStayId[
                source.SuperStay.HiveSuperStayId];

            foreach (var effectiveSegment in source.EffectiveExposureSegments) {
                foreach (var rawSegment in effectiveSegment.Sources) {
                    foreach (var yearSegment in SplitByCalendarYear(rawSegment)) {
                        if (!sourceSet.Index.TryGetForageProfile(
                                rawSegment.ApiaryStayId,
                                yearSegment.Year,
                                out var profile)) {
                            issues.Add(
                                new CompositionCalculationIssue(
                                    "composition.forage_profile_missing",
                                    "A required historical forage profile is missing.",
                                    source.SuperStay.HiveSuperStayId,
                                    rawSegment.ApiaryStayId,
                                    yearSegment.Year));
                            continue;
                        }

                        if (!TryValidateProfile(profile, out var profileIssue)) {
                            issues.Add(
                                new CompositionCalculationIssue(
                                    profileIssue.Code,
                                    profileIssue.Message,
                                    source.SuperStay.HiveSuperStayId,
                                    rawSegment.ApiaryStayId,
                                    yearSegment.Year));
                            continue;
                        }

                        var sourceWeight = harvestedFrames * yearSegment.Days;

                        foreach (var item in profile.Items) {
                            var normalizedForageType = item.ForageType.Trim();
                            var score = sourceWeight * item.Percentage * item.Intensity;

                            scores[normalizedForageType] = scores
                                .GetValueOrDefault(normalizedForageType)
                                + score;
                        }
                    }
                }
            }
        }

        if (issues.Count > 0) {
            return CompositionCalculationResult.Failure(issues);
        }

        var totalScore = scores.Values.Sum();

        if (totalScore <= 0) {
            return CompositionCalculationResult.Failure(
                new CompositionCalculationIssue(
                    "composition.no_calculable_data",
                    "Historical source data produced no calculable composition score.",
                    null,
                    null,
                    null));
        }

        return CompositionCalculationResult.Success(
            NormalizePercentages(scores, totalScore));
    }

    private static IEnumerable<YearSegment> SplitByCalendarYear(
        RawExposureSegment segment) {
        var startedOn = segment.StartedOn;

        while (startedOn <= segment.EndedOn) {
            var endedOn = new DateOnly(startedOn.Year, 12, 31);

            if (endedOn > segment.EndedOn) {
                endedOn = segment.EndedOn;
            }

            yield return new YearSegment(
                startedOn.Year,
                endedOn.DayNumber - startedOn.DayNumber + 1);

            startedOn = endedOn.AddDays(1);
        }
    }

    private static bool TryValidateProfile(
        ForageProfileHarvestSource profile,
        out ProfileValidationIssue issue) {
        if (profile.Items.Count == 0) {
            issue = new ProfileValidationIssue(
                "composition.forage_profile_empty",
                "A required historical forage profile contains no items.");
            return false;
        }

        if (profile.Items.Any(
                x => string.IsNullOrWhiteSpace(x.ForageType)
                    || x.Percentage <= 0
                    || x.Percentage > 100
                    || x.Intensity is < 1 or > 5)
            || profile.Items.Select(x => x.ForageType.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count() != profile.Items.Count
            || profile.Items.Sum(x => x.Percentage) != 100m) {
            issue = new ProfileValidationIssue(
                "composition.forage_profile_invalid",
                "A required historical forage profile contains invalid items.");
            return false;
        }

        issue = default;
        return true;
    }

    private static IReadOnlyList<CalculatedCompositionItem>
        NormalizePercentages(
            IReadOnlyDictionary<string, decimal> scores,
            decimal totalScore) {
        var parts = scores
            .Select(
                x => new PercentagePart(
                    x.Key,
                    decimal.Floor(x.Value / totalScore * 100m),
                    x.Value / totalScore * 100m % 1m))
            .ToList();

        var remaining = 100 - parts.Sum(x => (int)x.BasePercentage);

        foreach (var part in parts
                     .OrderByDescending(x => x.Remainder)
                     .ThenBy(x => x.ForageType, StringComparer.OrdinalIgnoreCase)
                     .ThenBy(x => x.ForageType, StringComparer.Ordinal)
                     .Take(remaining)) {
            part.Percentage = (int)part.BasePercentage + 1;
        }

        foreach (var part in parts.Where(x => x.Percentage == 0)) {
            part.Percentage = (int)part.BasePercentage;
        }

        return parts
            .Where(x => x.Percentage > 0)
            .OrderByDescending(x => x.Percentage)
            .ThenBy(x => x.ForageType, StringComparer.OrdinalIgnoreCase)
            .ThenBy(x => x.ForageType, StringComparer.Ordinal)
            .Select(x => new CalculatedCompositionItem(x.ForageType, x.Percentage))
            .ToList();
    }

    private sealed record YearSegment(int Year, int Days);

    private readonly record struct ProfileValidationIssue(
        string Code,
        string Message);

    private sealed class PercentagePart(
        string forageType,
        decimal basePercentage,
        decimal remainder) {
        public string ForageType { get; } = forageType;
        public decimal BasePercentage { get; } = basePercentage;
        public decimal Remainder { get; } = remainder;
        public int Percentage { get; set; }
    }
}

internal sealed record CalculatedCompositionItem(
    string ForageType,
    int Percentage);

internal sealed record CompositionCalculationIssue(
    string Code,
    string Message,
    Guid? HiveSuperStayId,
    Guid? ApiaryStayId,
    int? Year);

internal sealed record CompositionCalculationResult(
    IReadOnlyList<CalculatedCompositionItem> Items,
    IReadOnlyList<CompositionCalculationIssue> Issues) {
    public bool IsSuccess => Issues.Count == 0;

    public static CompositionCalculationResult Success(
        IReadOnlyList<CalculatedCompositionItem> items) =>
        new(items, []);

    public static CompositionCalculationResult Failure(
        params CompositionCalculationIssue[] issues) =>
        new([], issues);

    public static CompositionCalculationResult Failure(
        IReadOnlyList<CompositionCalculationIssue> issues) =>
        new([], issues);
}
