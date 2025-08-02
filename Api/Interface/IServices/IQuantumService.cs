using Api.DTOs;

namespace Api.Interface.IServices
{
    public interface IQuantumService
    {
        Task<string> GenerateQuantumCodeAsync();
        Task<int> GroverSearchAsync(int target, int nQubits);
        Task<byte[]> GenerateQuantumSaltBatchedAsync(int batchSize = 24);
    }
}
