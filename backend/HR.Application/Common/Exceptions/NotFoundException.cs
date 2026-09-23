namespace HR.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : Exception
{
    public List<string> Errors { get;  }
    public ValidationException(List<string> errors) : base("One or more validation failures occured.")
    {
        Errors = errors;
    }
}
