namespace PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

public sealed class HiveStay {
    private HiveStay() {
    }

    private HiveStay(
        Guid hiveId,
        Guid apiaryId,
        DateTimeOffset startedAtUtc) {
        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive ID cannot be empty.",
                nameof(hiveId));
        }

        if (apiaryId == Guid.Empty) {
            throw new ArgumentException(
                "Apiary ID cannot be empty.",
                nameof(apiaryId));
        }

        Id = Guid.NewGuid();

        HiveId =
            hiveId;

        ApiaryId =
            apiaryId;

        StartedAtUtc =
            startedAtUtc;

        EndedAtUtc =
            null;

        Note =
            null;
    }

    public Guid Id { get; private set; }

    public Guid HiveId { get; private set; }

    public Guid ApiaryId { get; private set; }

    public DateTimeOffset StartedAtUtc { get; private set; }

    public DateTimeOffset? EndedAtUtc { get; private set; }

    public string? Note { get; private set; }

    public static HiveStay Create(
        Guid hiveId,
        Guid apiaryId,
        DateTimeOffset startedAtUtc) {
        return new HiveStay(
            hiveId,
            apiaryId,
            startedAtUtc);
    }

    public void Close(
        DateTimeOffset endedAtUtc) {
        if (EndedAtUtc is not null) {
            throw new InvalidOperationException(
                "Hive stay is already closed.");
        }

        if (endedAtUtc < StartedAtUtc) {
            throw new ArgumentException(
                "Hive stay end date cannot be before its start date.",
                nameof(endedAtUtc));
        }

        EndedAtUtc =
            endedAtUtc;
    }

}