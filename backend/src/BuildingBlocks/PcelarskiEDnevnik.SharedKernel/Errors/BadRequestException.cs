namespace PcelarskiEDnevnik.SharedKernel.Errors;

public sealed class BadRequestException : Exception {
    public BadRequestException(
        string code,
        string message,
        object? violations = null) : base(message) {
        Code = code;
        Violations = violations;
    }

    public string Code { get; }

    public object? Violations { get; }
}
