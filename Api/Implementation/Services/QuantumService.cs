using Api.Interface.IServices;
using Microsoft.Quantum.Simulation.Core;
using Microsoft.Quantum.Simulation.Simulators;

namespace Api.Implementation.Services
{
    public class QuantumService : IQuantumService
    {
        public async Task<string> GenerateQuantumCodeAsync()
        {
            using var sim = new QuantumSimulator();

            // 20 bits = 5 hex digits (4 bits per hex digit)
            var result = await QSharp.GenerateQuantumBits.Run(sim, 20);

            var binaryString = string.Concat(result.Select(r => r == Result.One ? "1" : "0"));

            string token = ConvertBinaryToHex(binaryString);

            return token;
        }

        public async Task<int> GroverSearchAsync(int target, int nQubits)
        {
            using var sim = new QuantumSimulator();

            var result = await QSharp.GroverSearch.Run(sim, target, nQubits);

            return (int)result;
        }

        public async Task<byte[]> GenerateQuantumSaltAsync(int bitLength)
        {
            using var sim = new QuantumSimulator();
            var result = await QSharp.GenerateEntropyBits.Run(sim, bitLength);

            string binaryString = string.Concat(result.Select(r => r == Result.One ? "1" : "0"));
            var byteArray = Enumerable.Range(0, binaryString.Length / 8)
                .Select(i => Convert.ToByte(binaryString.Substring(i * 8, 8), 2))
                .ToArray();

            return byteArray;
        }

        public async Task<byte[]> GenerateQuantumSaltBatchedAsync(int batchSize = 24)
        {
            List<byte> allBytes = new List<byte>();
            int bitsGenerated = 0;
            int totalBits = 128;

            while (bitsGenerated < totalBits)
            {
                int bitsThisBatch = Math.Min(batchSize, totalBits - bitsGenerated);
                byte[] batch = await GenerateQuantumSaltAsync(bitsThisBatch);
                allBytes.AddRange(batch);
                bitsGenerated += bitsThisBatch;
            }

            // Trim to exact bit count if not a multiple of 8
            int totalBytes = (totalBits + 7) / 8;
            return allBytes.Take(totalBytes).ToArray();
        }

        static string ConvertBinaryToHex(string binaryString)
        {
            int padding = (4 - (binaryString.Length % 4)) % 4;
            string paddedBinary = binaryString.PadLeft(binaryString.Length + padding, '0');

            string hex = "";
            for (int i = 0; i < paddedBinary.Length; i += 4)
            {
                string chunk = paddedBinary.Substring(i, 4);
                int value = Convert.ToInt32(chunk, 2);
                hex += value.ToString("X");
            }

            return hex;
        }
    }
}