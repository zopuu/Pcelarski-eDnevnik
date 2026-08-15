namespace PcelarskiEDnevnik.SharedKernel.Authentication;

public interface ICurrentUserContext {
    bool IsAuthenticated { get; }

    Guid UserId { get; }
}