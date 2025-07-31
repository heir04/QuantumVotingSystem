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

        static string ConvertBinaryToHex(string binaryString)
        {
            // Pad to make it divisible by 4 for hex conversion
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