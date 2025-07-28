using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IQuantumService
    {
        Task<string> GenerateQuantumCodeAsync();
    }
}
