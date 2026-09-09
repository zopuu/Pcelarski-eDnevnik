using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.GetById;

public static class GetHiveInspectionByIdEndpoint {
    public static RouteGroupBuilder MapGetHiveInspectionByIdEndpoint(
        this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/inspections/{inspectionId:guid}",
                HandleAsync)
            .WithName("GetHiveInspectionById")
            .Produces<HiveInspectionDetailsResponse>()
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    private static async Task<IResult> HandleAsync(
        Guid hiveId,
        Guid inspectionId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(
            cancellationToken);
        var ownsHive = await dbContext.Hives
            .AsNoTracking()
            .AnyAsync(
                hive => hive.Id == hiveId &&
                    hive.OwnerBeekeeperId == beekeeperId,
                cancellationToken);

        if (!ownsHive) {
            return Results.NotFound();
        }

        var inspection = await dbContext.HiveInspections
            .AsNoTracking()
            .Where(inspection => inspection.Id == inspectionId &&
                inspection.HiveId == hiveId)
            .Select(inspection => new HiveInspectionDetailsResponse {
                Id = inspection.Id,
                HiveId = inspection.HiveId,
                PerformedAt = inspection.PerformedAt,
                InspectionType = inspection.InspectionType,
                OverallConditionRating = inspection.OverallConditionRating,
                PopulationRating = inspection.PopulationRating,
                TemperamentRating = inspection.TemperamentRating,
                ColonyStrength = inspection.ColonyStrength,
                BeeCoveredFrameCount = inspection.BeeCoveredFrameCount,
                BroodFrameCount = inspection.BroodFrameCount,
                HoneyFrameCount = inspection.HoneyFrameCount,
                PollenFrameCount = inspection.PollenFrameCount,
                HasSwarmed = inspection.HasSwarmed,
                HoneyStoresRating = inspection.HoneyStoresRating,
                PollenStoresRating = inspection.PollenStoresRating,
                BroodCoveragePercentage = inspection.BroodCoveragePercentage,
                OpenBroodFrameCount = inspection.OpenBroodFrameCount,
                CappedBroodFrameCount = inspection.CappedBroodFrameCount,
                BroodPattern = inspection.BroodPattern,
                BroodStage = inspection.BroodStage,
                DroneBroodPresent = inspection.DroneBroodPresent,
                DroneBroodExtent = inspection.DroneBroodExtent,
                LarvaePresence = inspection.LarvaePresence,
                DroneWorkerBalance = inspection.DroneWorkerBalance,
                BroodQuality = inspection.BroodQuality,
                QueenSeen = inspection.QueenSeen,
                QueenMarked = inspection.QueenMarked,
                QueenCellCount = inspection.QueenCellCount,
                QueenCellStage = inspection.QueenCellStage,
                SwarmingTendency = inspection.SwarmingTendency,
                FoodStoreAssessment = inspection.FoodStoreAssessment,
                PollenStoreAssessment = inspection.PollenStoreAssessment,
                StarvationRisk = inspection.StarvationRisk,
                VarroaLevel = inspection.VarroaLevel,
                Disease = inspection.Disease,
                DiseaseOther = inspection.DiseaseOther,
                Pest = inspection.Pest,
                PestOther = inspection.PestOther,
                Predator = inspection.Predator,
                PredatorOther = inspection.PredatorOther,
                MoldPresent = inspection.MoldPresent,
                ExcessMoisturePresent = inspection.ExcessMoisturePresent,
                DeadBeeLevel = inspection.DeadBeeLevel,
                Odor = inspection.Odor,
                ImageUrl = inspection.ImageUrl,
                Notes = inspection.Notes
            })
            .SingleOrDefaultAsync(cancellationToken);

        return inspection is null
            ? Results.NotFound()
            : Results.Ok(inspection);
    }
}

public sealed record HiveInspectionDetailsResponse {
    public Guid Id { get; init; }
    public Guid HiveId { get; init; }
    public DateTimeOffset PerformedAt { get; init; }
    public HiveInspectionType? InspectionType { get; init; }
    public short? OverallConditionRating { get; init; }
    public short? PopulationRating { get; init; }
    public short? TemperamentRating { get; init; }
    public short? ColonyStrength { get; init; }
    public short? BeeCoveredFrameCount { get; init; }
    public short? BroodFrameCount { get; init; }
    public short? HoneyFrameCount { get; init; }
    public short? PollenFrameCount { get; init; }
    public bool? HasSwarmed { get; init; }
    public short? HoneyStoresRating { get; init; }
    public short? PollenStoresRating { get; init; }
    public int? BroodCoveragePercentage { get; init; }
    public short? OpenBroodFrameCount { get; init; }
    public short? CappedBroodFrameCount { get; init; }
    public BroodPattern? BroodPattern { get; init; }
    public BroodStage? BroodStage { get; init; }
    public bool? DroneBroodPresent { get; init; }
    public short? DroneBroodExtent { get; init; }
    public short? LarvaePresence { get; init; }
    public short? DroneWorkerBalance { get; init; }
    public short? BroodQuality { get; init; }
    public bool? QueenSeen { get; init; }
    public bool? QueenMarked { get; init; }
    public short? QueenCellCount { get; init; }
    public short? QueenCellStage { get; init; }
    public short? SwarmingTendency { get; init; }
    public short? FoodStoreAssessment { get; init; }
    public short? PollenStoreAssessment { get; init; }
    public short? StarvationRisk { get; init; }
    public short? VarroaLevel { get; init; }
    public HiveDisease? Disease { get; init; }
    public string? DiseaseOther { get; init; }
    public HivePest? Pest { get; init; }
    public string? PestOther { get; init; }
    public HivePredator? Predator { get; init; }
    public string? PredatorOther { get; init; }
    public bool? MoldPresent { get; init; }
    public bool? ExcessMoisturePresent { get; init; }
    public short? DeadBeeLevel { get; init; }
    public short? Odor { get; init; }
    public string? ImageUrl { get; init; }
    public string? Notes { get; init; }
}
