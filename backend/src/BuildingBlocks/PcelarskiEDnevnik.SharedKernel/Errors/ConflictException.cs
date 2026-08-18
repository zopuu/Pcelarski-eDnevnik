namespace PcelarskiEDnevnik.SharedKernel.Errors;

public sealed class ConflictException : Exception {
    public ConflictException(
        string code,
        string message,
        Exception? innerException = null)
        : base(message, innerException) {
        Code = code;
    }

    public string Code { get; }
}