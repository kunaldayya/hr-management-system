using System.Text.Json.Serialization;

namespace HR.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Status { get; set; }
    public string Message { get; set; } = string.Empty;

    // Do not use JsonIgnore WhenWritingNull on Data: for T=bool this property is
    // a non-nullable value type and System.Text.Json throws at serialize time.
    public T? Data { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Success(T data, string message = "Request processed successfully") =>
        new() { Status = true, Message = message, Data = data };

    public static ApiResponse<T> Failure(string message, List<string>? errors = null) =>
        new() { Status = false, Message = message, Errors = errors };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Success(string message = "Request processed successfully") =>
        new() { Status = true, Message = message };
}
