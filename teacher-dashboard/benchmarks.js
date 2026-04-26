// benchmarks.js

// Map dropdown values → JSON files
const BENCHMARK_MAP = {
  q4: "benchmarks/mgb_6th_grade_q4_benchmark.json"
};

// Load benchmark JSON
export async function loadBenchmark(benchmarkKey) {
  const path = BENCHMARK_MAP[benchmarkKey];

  if (!path) {
    console.error("No benchmark found for:", benchmarkKey);
    return null;
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to fetch benchmark");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error loading benchmark:", err);
    return null;
  }
}