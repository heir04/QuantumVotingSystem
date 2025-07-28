namespace QSharp {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Canon;

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
}
