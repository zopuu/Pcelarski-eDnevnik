using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;

internal sealed class HarvestFrameAllocator {
    public IReadOnlyList<HarvestFrameAllocation>
        Allocate(
            HarvestSourceGroup group,
            int requestedFrameCount) {
        if (requestedFrameCount <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(requestedFrameCount));
        }

        var totalAvailable =
            group.Sources.Sum(
                x =>
                    x.SuperStay
                        .RemainingHarvestableFrameCount);

        if (requestedFrameCount >
            totalAvailable) {
            throw new ConflictException(
                "harvests.insufficient_available_frames",
                "The requested number of frames is no longer available.");
        }

        var ordered =
            group.Sources
                .OrderBy(
                    x =>
                        x.SuperStay.EndedOn)
                .ThenBy(
                    x =>
                        x.SuperStay.StartedOn)
                .ThenBy(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId)
                .ToList();

        var allocations =
            new List<HarvestFrameAllocation>();

        var remainingToAllocate =
            requestedFrameCount;

        foreach (var source in ordered) {
            if (remainingToAllocate == 0) {
                break;
            }

            var available =
                source.SuperStay
                    .RemainingHarvestableFrameCount;

            if (available <= 0) {
                continue;
            }

            var take =
                Math.Min(
                    available,
                    remainingToAllocate);

            allocations.Add(
                new HarvestFrameAllocation(
                    source,
                    take));

            remainingToAllocate -=
                take;
        }

        if (remainingToAllocate != 0) {
            throw new ConflictException(
                "harvests.insufficient_available_frames",
                "The requested number of frames is no longer available.");
        }

        return allocations;
    }
}