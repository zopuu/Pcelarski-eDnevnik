# Pčelarski eDnevnik — Validation and Error Handling Guide

## Purpose

This document defines the project-wide conventions for:

- request validation,
- domain rules,
- business conflicts,
- persistence/database errors,
- global exception handling,
- Problem Details responses,
- endpoint-level error behavior.

The goal is that every future module and feature behaves consistently.

---

# 1. General rule

Use the following responsibility split:

```text
HTTP request
    ↓
Request DTO validation
    ↓
Endpoint / feature logic
    ↓
Domain entity rules
    ↓
Persistence
    ↓
Global exception handling
    ↓
ProblemDetails response
```

Each layer has a specific responsibility.

---

# 2. What belongs where

## Request DTO

Use request DTO validation for input-shape rules such as:

- maximum string length,
- required fields,
- regular-expression formats,
- ranges,
- enum validation.

Examples:

```csharp
[StringLength(30)]
public string? Name { get; init; }
```

```csharp
[RegularExpression(
    ApiaryRules.IdentificationNumberPattern)]
public string? IdentificationNumber { get; init; }
```

Do not put database queries or business workflows inside request validators.

---

## Domain entity

The domain entity should protect important business invariants and normalize its own state.

Examples:

- owner ID cannot be empty,
- trim optional text,
- convert whitespace-only values to `null`,
- update `UpdatedAtUtc`,
- prevent logically invalid state transitions.

Example:

```csharp
public void Update(
    string? identificationNumber,
    string? name,
    ApiaryType? type,
    ApiaryStatus? status)
{
    IdentificationNumber =
        NormalizeOptionalText(
            identificationNumber);

    Name =
        NormalizeOptionalText(name);

    Type = type;
    Status = status;

    UpdatedAtUtc =
        DateTimeOffset.UtcNow;
}
```

---

## Endpoint

The endpoint should coordinate the use case.

Typical responsibilities:

1. resolve the current authenticated beekeeper,
2. query data scoped to that beekeeper,
3. call domain methods,
4. save through EF Core,
5. return the correct HTTP result.

Keep endpoints small.

Do not duplicate validation/error infrastructure in every endpoint.

---

## Infrastructure / Persistence

Database-specific knowledge belongs here.

Examples:

- PostgreSQL constraint names,
- unique constraint detection,
- EF Core configuration,
- transaction handling,
- database-specific exception translation.

Do not expose PostgreSQL exceptions directly to the API response.

---

## API Host

The API Host owns HTTP-wide concerns:

- global exception handling,
- Problem Details,
- authentication,
- authorization,
- CORS,
- OpenAPI,
- middleware pipeline.

Modules should not reference `PcelarskiEDnevnik.Api`.

Dependency direction:

```text
PcelarskiEDnevnik.Api
        ↓
Modules
        ↓
SharedKernel
```

Never:

```text
Module
   ↓
PcelarskiEDnevnik.Api
```

---

# 3. Shared domain rule constants

Do not repeat values such as `30`, `14`, or regex patterns in many files.

Create a rules class in the relevant module.

Example:

```csharp
namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public static class ApiaryRules
{
    public const int NameMaxLength = 30;

    public const int IdentificationNumberMaxLength = 14;

    public const string IdentificationNumberPattern =
        @"^RS[0-9]{12}$";
}
```

Reuse those constants in:

- request DTO validation,
- EF Core configuration,
- domain logic where relevant.

Example EF configuration:

```csharp
builder.Property(x => x.Name)
    .HasColumnName("name")
    .HasMaxLength(ApiaryRules.NameMaxLength);
```

---

# 4. Request validation standard

Use DataAnnotations for straightforward request validation.

Example:

```csharp
using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed record CreateApiaryRequest
{
    [RegularExpression(
        ApiaryRules.IdentificationNumberPattern,
        ErrorMessage =
            "Identification number must have format RS followed by 12 digits.")]
    public string? IdentificationNumber { get; init; }

    [StringLength(
        ApiaryRules.NameMaxLength,
        ErrorMessage =
            "Apiary name cannot exceed 30 characters.")]
    public string? Name { get; init; }

    [EnumDataType(
        typeof(ApiaryType),
        ErrorMessage = "Invalid apiary type.")]
    public ApiaryType? Type { get; init; }

    [EnumDataType(
        typeof(ApiaryStatus),
        ErrorMessage = "Invalid apiary status.")]
    public ApiaryStatus? Status { get; init; }
}
```

The API Host must register:

```csharp
services.AddValidation();
```

Invalid requests should return:

```text
400 Bad Request
```

Do not manually duplicate these checks inside the endpoint unless the rule cannot be expressed appropriately at request-validation level.

---

# 5. Separate Create and Update request DTOs

Even if Create and Update currently contain identical fields, keep separate types:

```text
CreateApiaryRequest
UpdateApiaryRequest
```

Reason:

- rules may diverge later,
- one operation may require a field while another allows `null`,
- separate request contracts prevent accidental coupling.

Do not reuse one DTO everywhere just because fields currently match.

---

# 6. Standard HTTP status codes

Use these conventions throughout the project.

| Situation | Status |
|---|---:|
| Successful GET | 200 |
| Successful PUT | 200 |
| Successful POST | 201 |
| Validation failure | 400 |
| Not authenticated | 401 |
| Authenticated but forbidden | 403 |
| Resource not found / not owned | 404 |
| Business/data conflict | 409 |
| Unexpected server failure | 500 |

---

# 7. Ownership-aware queries

For user-owned/domain-owned resources, authorization should be part of the query whenever possible.

Correct:

```csharp
var apiary = await dbContext.Apiaries
    .SingleOrDefaultAsync(
        x =>
            x.Id == id &&
            x.OwnerBeekeeperId == beekeeperId,
        cancellationToken);
```

Avoid:

```csharp
var apiary = await dbContext.Apiaries
    .FindAsync(id);

// then check owner afterward
```

The first approach:

- avoids leaking existence of another user's resource,
- keeps authorization close to data retrieval,
- produces a clean `404` for resources the current beekeeper must not access.

---

# 8. Read-only queries

For read-only endpoints use:

```csharp
.AsNoTracking()
```

Example:

```csharp
var apiaries = await dbContext.Apiaries
    .AsNoTracking()
    .Where(x =>
        x.OwnerBeekeeperId == beekeeperId)
    .Select(x =>
        new ApiaryListItemResponse(
            x.Id,
            x.IdentificationNumber,
            x.Name,
            x.Type,
            x.Status))
    .ToListAsync(cancellationToken);
```

Do not use `AsNoTracking()` when loading an entity that will be modified and saved.

---

# 9. Do not return EF/domain entities directly

Use response DTOs.

Correct:

```csharp
public sealed record GetApiaryByIdResponse(
    Guid Id,
    string? IdentificationNumber,
    string? Name,
    ApiaryType? Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
```

Benefits:

- prevents accidental exposure of internal fields,
- stabilizes the external API contract,
- allows domain model changes independently,
- avoids exposing ownership IDs unless the client needs them.

---

# 10. Global semantic exceptions

Shared reusable API-independent exceptions belong in SharedKernel.

Example:

```text
PcelarskiEDnevnik.SharedKernel
└── Errors
    └── ConflictException.cs
```

Implementation:

```csharp
namespace PcelarskiEDnevnik.SharedKernel.Errors;

public sealed class ConflictException : Exception
{
    public ConflictException(
        string code,
        string message,
        Exception? innerException = null)
        : base(message, innerException)
    {
        Code = code;
    }

    public string Code { get; }
}
```

Usage:

```csharp
throw new ConflictException(
    "apiaries.identification_number_already_exists",
    "An apiary with this identification number already exists.");
```

The module communicates a semantic conflict.

The module does not decide how that conflict is serialized to HTTP.

---

# 11. Error code naming convention

Use stable machine-readable error codes.

Format:

```text
<module>.<problem>
```

Examples:

```text
apiaries.identification_number_already_exists
hives.identification_number_already_exists
accounts.email_already_exists
sales.invalid_state
server.unexpected_error
```

Rules:

- lowercase,
- dot-separated namespace,
- snake_case inside the problem name,
- never use UI text as the code,
- error codes should remain stable even if displayed messages later change or are localized.

Frontend logic may safely branch on `code`.

---

# 12. Global exception handler

Global HTTP exception conversion belongs in:

```text
PcelarskiEDnevnik.Api
└── ErrorHandling
    └── GlobalExceptionHandler.cs
```

Example:

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PcelarskiEDnevnik.SharedKernel.Errors;

internal sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails =
            exception switch
            {
                ConflictException conflict =>
                    CreateConflictProblem(
                        httpContext,
                        conflict),

                _ =>
                    CreateInternalServerProblem(
                        httpContext)
            };

        if (problemDetails.Status ==
            StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "Unhandled exception while processing {Method} {Path}. TraceId: {TraceId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);
        }

        httpContext.Response.StatusCode =
            problemDetails.Status!.Value;

        var problemDetailsService =
            httpContext.RequestServices
                .GetRequiredService<IProblemDetailsService>();

        await problemDetailsService.WriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = problemDetails,
                Exception = exception
            });

        return true;
    }

    private static ProblemDetails CreateConflictProblem(
        HttpContext context,
        ConflictException exception)
    {
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Conflict",
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        problem.Extensions["code"] =
            exception.Code;

        return problem;
    }

    private static ProblemDetails CreateInternalServerProblem(
        HttpContext context)
    {
        var problem = new ProblemDetails
        {
            Status =
                StatusCodes.Status500InternalServerError,
            Title =
                "An unexpected error occurred.",
            Detail =
                "The server could not complete the request.",
            Instance = context.Request.Path
        };

        problem.Extensions["code"] =
            "server.unexpected_error";

        return problem;
    }
}
```

Register globally:

```csharp
services.AddExceptionHandler<
    GlobalExceptionHandler>();
```

And keep:

```csharp
services.AddProblemDetails(...);
```

Middleware:

```csharp
app.UseExceptionHandler();
app.UseStatusCodePages();
```

---

# 13. Problem Details customization

Keep a `traceId` on all errors.

Example:

```csharp
services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails =
        context =>
        {
            context.ProblemDetails.Instance ??=
                context.HttpContext.Request.Path;

            context.ProblemDetails.Extensions["traceId"] =
                context.HttpContext.TraceIdentifier;
        };
});
```

This allows support/debugging to connect a frontend error with the exact backend request.

Never return stack traces or raw database exception messages to production clients.

---

# 14. PostgreSQL / persistence exception translation

The database remains the final authority for unique constraints.

Do not rely only on:

```csharp
AnyAsync(...)
```

because two concurrent requests can both pass the check and then attempt the same insert.

Keep the unique index in PostgreSQL.

Translate the database violation inside Infrastructure.

Example:

```csharp
using Microsoft.EntityFrameworkCore;
using Npgsql;

internal static class ApiaryPersistenceErrors
{
    private const string
        IdentificationNumberUniqueIndex =
            "ux_apiaries_identification_number";

    public static bool
        IsIdentificationNumberUniqueViolation(
            DbUpdateException exception)
    {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                IdentificationNumberUniqueIndex;
    }
}
```

Then in a write endpoint:

```csharp
try
{
    await dbContext.SaveChangesAsync(
        cancellationToken);
}
catch (DbUpdateException exception)
    when (
        ApiaryPersistenceErrors
            .IsIdentificationNumberUniqueViolation(
                exception))
{
    throw new ConflictException(
        "apiaries.identification_number_already_exists",
        "An apiary with this identification number already exists.",
        exception);
}
```

This produces:

```text
PostgreSQL unique violation
    ↓
Infrastructure recognizes constraint
    ↓
ConflictException
    ↓
GlobalExceptionHandler
    ↓
409 ProblemDetails
```

---

# 15. Why not catch `Exception` inside every endpoint

Do not do this:

```csharp
try
{
    ...
}
catch (Exception ex)
{
    return Results.BadRequest(ex.Message);
}
```

Problems:

- hides real bugs,
- produces inconsistent status codes,
- leaks internal information,
- duplicates logic,
- makes logging inconsistent.

Only catch exceptions locally when you can translate a specific known technical error into a meaningful application error.

Everything unexpected should propagate to the global handler.

---

# 16. Create endpoint template

Use this shape for future create operations:

```csharp
endpoints.MapPost(
    "/",
    async (
        CreateXRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        ModuleDbContext dbContext,
        CancellationToken cancellationToken) =>
    {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var entity = Entity.Create(
            beekeeperId,
            request.SomeValue);

        dbContext.Entities.Add(entity);

        try
        {
            await dbContext.SaveChangesAsync(
                cancellationToken);
        }
        catch (DbUpdateException exception)
            when (
                EntityPersistenceErrors
                    .IsKnownConflict(exception))
        {
            throw new ConflictException(
                "module.conflict_code",
                "Conflict message.",
                exception);
        }

        var response =
            new CreateXResponse(
                entity.Id);

        return Results.Created(
            $"/api/entities/{entity.Id}",
            response);
    });
```

---

# 17. Get-all endpoint template

```csharp
endpoints.MapGet(
    "/",
    async (
        ICurrentBeekeeperContext currentBeekeeper,
        ModuleDbContext dbContext,
        CancellationToken cancellationToken) =>
    {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var items =
            await dbContext.Entities
                .AsNoTracking()
                .Where(
                    x =>
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(
                    x => new ItemResponse(
                        x.Id))
                .ToListAsync(
                    cancellationToken);

        return Results.Ok(items);
    });
```

Empty collections should normally return:

```text
200 OK
[]
```

not `404`.

---

# 18. Get-by-id endpoint template

```csharp
endpoints.MapGet(
    "/{id:guid}",
    async (
        Guid id,
        ICurrentBeekeeperContext currentBeekeeper,
        ModuleDbContext dbContext,
        CancellationToken cancellationToken) =>
    {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var entity =
            await dbContext.Entities
                .AsNoTracking()
                .Where(
                    x =>
                        x.Id == id &&
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(
                    x => new DetailsResponse(
                        x.Id))
                .SingleOrDefaultAsync(
                    cancellationToken);

        if (entity is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(entity);
    });
```

Do not reveal whether an ID exists for another owner.

Return `404`.

---

# 19. Update endpoint template

```csharp
endpoints.MapPut(
    "/{id:guid}",
    async (
        Guid id,
        UpdateXRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        ModuleDbContext dbContext,
        CancellationToken cancellationToken) =>
    {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var entity =
            await dbContext.Entities
                .SingleOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.OwnerBeekeeperId ==
                        beekeeperId,
                    cancellationToken);

        if (entity is null)
        {
            return Results.NotFound();
        }

        entity.Update(
            request.SomeValue);

        try
        {
            await dbContext.SaveChangesAsync(
                cancellationToken);
        }
        catch (DbUpdateException exception)
            when (
                EntityPersistenceErrors
                    .IsKnownConflict(exception))
        {
            throw new ConflictException(
                "module.conflict_code",
                "Conflict message.",
                exception);
        }

        return Results.Ok(
            new UpdateXResponse(
                entity.Id));
    });
```

Do not use `AsNoTracking()` here because EF must track the entity for updates.

---

# 20. Authentication and current beekeeper

Never trust the frontend to tell the backend who owns a resource.

Do not accept:

```json
{
  "beekeeperId": "..."
}
```

for normal owner-scoped operations.

Use:

```csharp
var beekeeperId =
    await currentBeekeeper
        .GetBeekeeperIdAsync(
            cancellationToken);
```

Flow:

```text
Bearer token
    ↓
ICurrentUserContext
    ↓
Identity UserId
    ↓
ICurrentBeekeeperContext
    ↓
BeekeeperProfile.Id
    ↓
domain ownership query
```

---

# 21. Endpoint route groups

Each module/feature area should aggregate its endpoints.

Example:

```csharp
public static IEndpointRouteBuilder MapApiariesEndpoints(
    this IEndpointRouteBuilder endpoints)
{
    var group = endpoints
        .MapGroup("/api/apiaries")
        .WithTags("Apiaries")
        .RequireAuthorization();

    group.MapCreateApiaryEndpoint();
    group.MapGetApiariesEndpoint();
    group.MapGetApiaryByIdEndpoint();
    group.MapUpdateApiaryEndpoint();

    return endpoints;
}
```

Individual endpoints should then use relative routes:

```text
"/"
"/{id:guid}"
```

Do not repeat:

```text
/api/apiaries
```

inside every endpoint.

Do not repeat `.RequireAuthorization()` if the route group already applies it.

---

# 22. Folder convention for every feature

Use one subfolder per action:

```text
Features/
└── Apiaries/
    ├── ApiariesEndpoints.cs
    │
    ├── Create/
    │   ├── CreateApiaryEndpoint.cs
    │   ├── CreateApiaryRequest.cs
    │   └── CreateApiaryResponse.cs
    │
    ├── GetAll/
    │   ├── GetApiariesEndpoint.cs
    │   └── ApiaryListItemResponse.cs
    │
    ├── GetById/
    │   ├── GetApiaryByIdEndpoint.cs
    │   └── GetApiaryByIdResponse.cs
    │
    └── Update/
        ├── UpdateApiaryEndpoint.cs
        ├── UpdateApiaryRequest.cs
        └── UpdateApiaryResponse.cs
```

Continue the same structure in future modules.

---

# 23. When to introduce a handler/service

Do not create a service/repository just to move five lines around.

Direct endpoint + EF Core is acceptable for simple vertical slices.

Extract a handler when the use case becomes substantial, for example:

```text
validate subscription
    ↓
check apiary limit
    ↓
check permissions
    ↓
create aggregate
    ↓
create related records
    ↓
publish event
    ↓
save transaction
```

Then prefer:

```text
Create/
├── CreateApiaryEndpoint.cs
├── CreateApiaryRequest.cs
├── CreateApiaryResponse.cs
├── CreateApiaryCommand.cs
└── CreateApiaryHandler.cs
```

Prefer feature-specific handlers over one giant `ApiaryService`.

---

# 24. Repository rule

Do not introduce a generic repository merely to wrap EF Core.

Avoid:

```csharp
repository.Add(entity);
repository.Save();
```

when it only forwards to:

```csharp
dbContext.Entities.Add(entity);
dbContext.SaveChangesAsync();
```

A repository is justified when it hides meaningful aggregate-loading or persistence behavior, not simply because the project uses EF Core.

---

# 25. Error response examples

## Validation error

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "IdentificationNumber": [
      "Identification number must have format RS followed by 12 digits."
    ]
  },
  "traceId": "..."
}
```

## Conflict

```json
{
  "title": "Conflict",
  "status": 409,
  "detail": "An apiary with this identification number already exists.",
  "instance": "/api/apiaries",
  "code": "apiaries.identification_number_already_exists",
  "traceId": "..."
}
```

## Not found

```json
{
  "title": "Not Found",
  "status": 404,
  "traceId": "..."
}
```

## Unexpected error

```json
{
  "title": "An unexpected error occurred.",
  "status": 500,
  "detail": "The server could not complete the request.",
  "code": "server.unexpected_error",
  "traceId": "..."
}
```

---

# 26. Checklist for every new feature

Before considering a new endpoint finished, verify:

- [ ] Request DTO is separate from domain entity.
- [ ] Validation rules exist for client input.
- [ ] Shared constants are reused instead of duplicated magic values.
- [ ] Current user/beekeeper is resolved on the backend.
- [ ] Client does not provide ownership ID.
- [ ] Query is ownership-scoped.
- [ ] Read-only queries use `AsNoTracking()`.
- [ ] Domain entity controls state changes.
- [ ] Response DTO is used instead of returning the entity directly.
- [ ] Known database conflicts are translated to semantic exceptions.
- [ ] Unique constraints remain enforced by PostgreSQL.
- [ ] Unexpected exceptions are not caught in the endpoint.
- [ ] Correct HTTP status code is returned.
- [ ] Error responses use the global Problem Details mechanism.
- [ ] No raw database errors or stack traces are returned to clients.
- [ ] Endpoint is registered through the module route group.
- [ ] `Program.cs` does not know about individual feature endpoints.

---

# 27. Minimum test matrix for write features

For every create/update feature, test at least:

```text
valid request
invalid field format
invalid enum
too-long string
duplicate unique value
unauthenticated request
resource owned by another beekeeper
nonexistent ID
successful update
```

For ownership-sensitive endpoints, use at least two test users:

```text
Beekeeper A → Resource A
Beekeeper B → Resource B
```

Verify that B cannot read or modify A's resource.

---

# 28. Project-wide rule summary

Use this mental model:

```text
Validation errors
    → request validation
    → 400

Authentication
    → ASP.NET authentication
    → 401

Authorization / ownership
    → route policy + ownership-scoped queries
    → 403 or 404

Business conflicts
    → semantic exception
    → global exception handler
    → 409

Database-specific conflicts
    → Infrastructure translates technical error
    → semantic exception
    → global handler
    → 409

Unexpected bugs
    → global exception handler
    → logged internally
    → safe 500 ProblemDetails
```

This should remain the default pattern across Pčelarski eDnevnik unless a feature has a clear reason to deviate.
