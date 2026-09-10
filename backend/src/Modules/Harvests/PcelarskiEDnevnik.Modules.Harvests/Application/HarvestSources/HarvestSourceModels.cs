using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal readonly record struct UtcInterval(
    DateTimeOffset StartedAtUtc,
    DateTimeOffset EndedAtUtcExclusive) {
    public DateOnly StartedOn =>
        DateOnly.FromDateTime(
            StartedAtUtc.UtcDateTime);

    public DateOnly EndedOn =>
        DateOnly.FromDateTime(
            EndedAtUtcExclusive
                .AddTicks(-1)
                .UtcDateTime);

    public int DurationDays =>
        Math.Max(
            1,
            EndedOn.DayNumber -
            StartedOn.DayNumber +
            1);

    public static UtcInterval
        FromSuperStay(
            DateOnly startedOn,
            DateOnly endedOn) {
        return new UtcInterval(
            AtStartOfDayUtc(
                startedOn),
            AtStartOfDayUtc(
                endedOn.AddDays(1)));
    }

    public static bool TryIntersect(
        UtcInterval left,
        UtcInterval right,
        out UtcInterval intersection) {
        var start =
            left.StartedAtUtc >
            right.StartedAtUtc
                ? left.StartedAtUtc
                : right.StartedAtUtc;

        var end =
            left.EndedAtUtcExclusive <
            right.EndedAtUtcExclusive
                ? left.EndedAtUtcExclusive
                : right.EndedAtUtcExclusive;

        if (start >= end) {
            intersection = default;
            return false;
        }

        intersection =
            new UtcInterval(
                start,
                end);

        return true;
    }

    private static DateTimeOffset
        AtStartOfDayUtc(
            DateOnly date) {
        return new DateTimeOffset(
            date.ToDateTime(
                TimeOnly.MinValue),
            TimeSpan.Zero);
    }
}

internal sealed record RawExposureSegment(
    ApiaryStayHarvestSource ApiaryStay,
    ApiaryLocationHarvestSource Location,
    UtcInterval Interval) {
    public Guid ApiaryStayId =>
        ApiaryStay.Id;

    public Guid ApiaryId =>
        ApiaryStay.ApiaryId;

    public Guid LocationId =>
        Location.Id;

    public DateOnly StartedOn =>
        Interval.StartedOn;

    public DateOnly EndedOn =>
        Interval.EndedOn;

    public int DurationDays =>
        Interval.DurationDays;
}

internal sealed class EffectiveExposureSegment {
    public EffectiveExposureSegment(
        IReadOnlyList<RawExposureSegment>
            sources) {
        if (sources.Count == 0) {
            throw new ArgumentException(
                "An effective exposure segment requires at least one source.",
                nameof(sources));
        }

        Sources = sources;

        var startedAt =
            sources.Min(
                x =>
                    x.Interval
                        .StartedAtUtc);

        var endedAt =
            sources.Max(
                x =>
                    x.Interval
                        .EndedAtUtcExclusive);

        Interval =
            new UtcInterval(
                startedAt,
                endedAt);
    }

    public IReadOnlyList<RawExposureSegment>
        Sources {
        get;
    }

    public UtcInterval Interval {
        get;
    }

    public DateOnly StartedOn =>
        Interval.StartedOn;

    public DateOnly EndedOn =>
        Interval.EndedOn;

    public int DurationDays =>
        Interval.DurationDays;
}

internal sealed record ResolvedHarvestSource(
    HarvestableSuperStaySource SuperStay,
    IReadOnlyList<RawExposureSegment>
        RawExposureSegments,
    IReadOnlyList<EffectiveExposureSegment>
        EffectiveExposureSegments);

internal sealed record HarvestSourceResolutionIssue(
    Guid HiveSuperStayId,
    string Code,
    string Message);

internal sealed record HarvestSourceResolutionResult(
    ResolvedHarvestSource? Source,
    HarvestSourceResolutionIssue? Issue) {
    public bool IsSuccess =>
        Source is not null;

    public static HarvestSourceResolutionResult
        Success(
            ResolvedHarvestSource source) {
        return new HarvestSourceResolutionResult(
            source,
            null);
    }

    public static HarvestSourceResolutionResult
        Failure(
            Guid hiveSuperStayId,
            string code,
            string message) {
        return new HarvestSourceResolutionResult(
            null,
            new HarvestSourceResolutionIssue(
                hiveSuperStayId,
                code,
                message));
    }
}

internal sealed record HarvestSourceGroup(
    IReadOnlyList<ResolvedHarvestSource>
        Sources);