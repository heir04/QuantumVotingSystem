namespace Api.DTOs
{
    public class BaseResponse<T>
    {
        public string? Message { get; set; }
        public T? Data { get; set; }
        public bool Status { get; set; }
    }
}