namespace QSharp {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Math;
    open Microsoft.Quantum.Convert;
    open Microsoft.Quantum.Arrays;

    operation GenerateQuantumBits(count : Int) : Result[] {
        use qubits = Qubit[count];
        mutable results = [Zero, size = count];

        for i in 0..count - 1 {
            H(qubits[i]);
            let r = M(qubits[i]);
            set results w/= i <- r;
        }

        ResetAll(qubits);
        return results;
    }

    operation GroverSearch(target : Int, nQubits : Int) : Int {
        use qubits = Qubit[nQubits];

        // Step 1: Put all qubits in superposition
        ApplyToEach(H, qubits);

        // Define number of iterations ≈ π/4 * sqrt(N)
        let iterations = Round(PI() / 4.0 * Sqrt(IntAsDouble(2^nQubits)));

        for _ in 1..iterations {
            // Oracle: flips the sign if qubit state == target
            within {
                // Apply X gates where target bits are 0
                for idx in 0..nQubits - 1 {
                    if ((target &&& (1 <<< idx)) == 0) {
                        X(qubits[idx]);
                    }
                }
            } apply {
                Controlled Z(Most(qubits), Tail(qubits));
            }

            // Undo the X gates
            for idx in 0..nQubits - 1 {
                if ((target &&& (1 <<< idx)) == 0) {
                    X(qubits[idx]);
                }
            }

            ApplyToEach(H, qubits);
            ApplyToEach(X, qubits);
            Controlled Z(Most(qubits), Tail(qubits));
            ApplyToEach(X, qubits);
            ApplyToEach(H, qubits);
        }

        mutable result = 0;
        for i in 0..nQubits - 1 {
            let bit = MResetZ(qubits[i]);
            if (bit == One) {
                set result += (1 <<< i);
            }
        }
        return result;
    }

    operation GenerateEntropyBits(count : Int) : Result[] {
        use qubits = Qubit[count];
        mutable bits =[Zero, size = count];

        for i in 0..count - 1 {
            H(qubits[i]);
            set bits w/= i <- M(qubits[i]);
        }

        ResetAll(qubits);
        return bits;
    }

}