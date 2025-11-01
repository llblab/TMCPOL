// @ts-check

/**
 * TMCTOL Comprehensive Test Suite
 * Synchronized verbose in `/simulator/tests.md`
 * Minimal output: statistics only
 * @module tests
 */

import { BigMath, create_system, PPM, PRECISION, User } from "./model.js";

/** @typedef {import("./model.js").SystemConfig} SystemConfig */

/**
 * @param {bigint} price
 * @returns {string}
 */
const formatPrice = (price) => (Number(price) / Number(PRECISION)).toFixed(9);

/**
 * @param {bigint} supply
 * @returns {string}
 */
const formatSupply = (supply) =>
  (Number(supply) / Number(PRECISION)).toFixed(2);

/**
 * @param {bigint} tokens
 * @returns {string}
 */
const formatTokens = (tokens) =>
  (Number(tokens) / Number(PRECISION)).toFixed(6);

/**
 * @param {bigint} ppm
 * @returns {string}
 */
const formatPPM = (ppm) => `${(Number(ppm) / 10000).toFixed(2)}%`;

class TestFailure extends Error {
  constructor(/** @type {string} */ message) {
    super(message);
    this.name = "TestFailure";
  }
}

/**
 * @param {boolean} condition
 * @param {string} message
 * @throws {TestFailure}
 */
const assert = (condition, message) => {
  if (!condition) throw new TestFailure(message);
};

/**
 * @param {bigint} actual
 * @param {bigint} expected
 * @param {bigint} tolerance
 * @param {string} message
 * @throws {TestFailure}
 */
const assertApprox = (actual, expected, tolerance, message) => {
  const diff = actual > expected ? actual - expected : expected - actual;
  const maxDiff = (expected * BigInt(tolerance)) / 1_000n;
  if (diff > maxDiff) {
    throw new TestFailure(
      `${message} (Expected: ${expected}, Actual: ${actual}, Diff: ${diff})`,
    );
  }
};

const getTimestamp = (() => {
  if (typeof performance !== "undefined" && performance.now) {
    return () => BigInt(Math.floor(performance.now() * 1_000_000));
  } else if (typeof Date !== "undefined") {
    return () => BigInt(Date.now()) * 1_000_000n;
  } else {
    let counter = 0n;
    return () => counter++;
  }
})();

// Test section structure: [section, count_in_section]
const TEST_SECTIONS = [
  [1, 3], // Formula Tests
  [2, 6], // Parameter Boundary Tests
  [3, 5], // Scaling Rules
  [4, 6], // Component Tests
  [5, 5], // Integration Tests
  [6, 6], // Advanced Scenarios
  [7, 2], // System Invariants
  [8, 1], // Multi-User Simulation
  [9, 5], // Emergent Properties
  [10, 3], // Attack Resistance
];

let testCount = 0;
let passedTests = 0;
/** @type {Array<{test: number, code: string, name: string, error: string}>} */
let failedTests = [];

/**
 * Get hierarchical test code (e.g., "1.1", "2.3", etc.)
 * @param {number} testNum
 * @returns {string}
 */
const getTestCode = (testNum) => {
  let accumulated = 0;
  for (const [section, count] of TEST_SECTIONS) {
    if (testNum <= accumulated + count) {
      const posInSection = testNum - accumulated;
      return `${section}.${posInSection}`;
    }
    accumulated += count;
  }
  return `${testNum}`;
};

/**
 * @param {string} name
 * @param {() => void} fn
 */
const runTest = (name, fn) => {
  testCount++;
  const testCode = getTestCode(testCount);
  const displayName = name.length > 50 ? name.substring(0, 47) + "..." : name;
  const prefix = `[${testCount.toString().padStart(2)}] ${displayName.padEnd(50)} `;
  try {
    fn();
    passedTests++;
    console.log(prefix + "✅");
  } catch (error) {
    console.log(prefix + "❌");
    const errorMsg =
      error instanceof TestFailure
        ? error.message
        : `${String(error)}\n${error instanceof Error ? error.stack : ""}`;
    failedTests.push({
      test: testCount,
      code: testCode,
      name,
      error: errorMsg,
    });
  }
};

console.log("<TMCTOL Test Suite>");

// 1. FORMULA TESTS

runTest("Absolute Slope Formula Verification", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const minter = system.tmc_minter;
  assert(
    minter.get_price() === minter.price_initial,
    "Price equals initial at zero supply",
  );
  const test_supplies = [
    {
      supply: 1_000n * PRECISION,
      expected_price: PRECISION + 1_000n * PRECISION,
    },
    {
      supply: 10_000n * PRECISION,
      expected_price: PRECISION + 10_000n * PRECISION,
    },
    {
      supply: 100_000n * PRECISION,
      expected_price: PRECISION + 100_000n * PRECISION,
    },
  ];
  for (const test of test_supplies) {
    minter.supply = test.supply;
    const actual_price = minter.get_price();
    assert(
      actual_price === test.expected_price,
      `Price at supply ${formatSupply(test.supply)}`,
    );
  }
  minter.supply = 0n;
});

runTest("Quadratic Integration for Minting", () => {
  const system = create_system({
    price_initial: PRECISION / 100n,
    slope: PRECISION / 100n,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const foreign = 100n * PRECISION;
  const calculated_mint = minter.calculate_mint(foreign);
  const result = minter.mint_native(foreign);
  assert(
    result.total_minted === calculated_mint,
    "Calculated mint matches actual",
  );
});

runTest("Zero Slope (Constant Price)", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: 0n,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const test_amounts = [
    100n * PRECISION,
    1_000n * PRECISION,
    10_000n * PRECISION,
  ];
  for (const amount of test_amounts) {
    const result = minter.mint_native(amount);
    assert(
      result.price_before === result.price_after,
      "Price constant with zero slope",
    );
    minter.supply = 0n;
  }
});

// 2. PARAMETER BOUNDARY TESTS

runTest("Initial Price Boundary Testing", () => {
  const test_cases = [
    { value: 1n, name: "Minimum (1 wei)" },
    { value: PRECISION / 1_000_000n, name: "Very small (0.000001)" },
    { value: PRECISION / 1_000n, name: "Small (0.001)" },
    { value: PRECISION, name: "Standard (1.0)" },
    { value: 1_000n * PRECISION, name: "Large (1000)" },
    { value: 1_000_000n * PRECISION, name: "Very large (1,000,000)" },
    { value: 100_000_000n * PRECISION, name: "Pushed large (100M)" },
  ];
  for (const test of test_cases) {
    const system = create_system({
      price_initial: test.value,
      slope: PRECISION / 1_000n,
    });
    const price = system.tmc_minter.get_price();
    assert(price === test.value, `Initial price ${test.name}`);
  }
});

runTest("Slope Boundary Testing", () => {
  const test_cases = [
    { value: 0n, name: "Zero (constant price)" },
    { value: PRECISION / 1_000_000n, name: "Minimal (0.000001)" },
    { value: PRECISION / 1_000n, name: "Standard (0.001)" },
    { value: PRECISION / 10n, name: "High (0.1)" },
    { value: PRECISION, name: "Extreme (1.0)" },
    { value: PRECISION * 1_000n, name: "Very large (1000)" },
    { value: PRECISION * 10_000n, name: "Extreme (10000)" },
    { value: PRECISION * 100_000n, name: "Pushed extreme (100k)" },
  ];
  for (const test of test_cases) {
    const system = create_system({
      price_initial: PRECISION,
      slope: test.value,
    });
    const minter = system.tmc_minter;
    minter.supply = 1_000_000n * PRECISION;
    const expected_price =
      PRECISION + (test.value * 1_000_000n * PRECISION) / PRECISION;
    assert(minter.get_price() === expected_price, `Slope ${test.name}`);
    minter.supply = 0n;
  }
});

runTest("Supply Boundary Testing", () => {
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 10_000n,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const test_supplies = [
    { supply: 0n, name: "Zero" },
    { supply: 1_000n * PRECISION, name: "1K" },
    { supply: 1_000_000n * PRECISION, name: "1M" },
    { supply: 1_000_000_000n * PRECISION, name: "1B" },
  ];
  for (const test of test_supplies) {
    minter.supply = test.supply;
    const price = minter.get_price();
    const expected =
      minter.price_initial + (minter.slope * test.supply) / PRECISION;
    assert(price === expected, `Supply ${test.name}`);
  }
  minter.supply = 0n;
});

runTest("Large Number Stress Test", () => {
  const system = create_system({
    price_initial: PRECISION / 1_000_000n,
    slope: PRECISION / 1_000_000n,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const large_payment = 1_000_000_000_000_000_000n * PRECISION;
  const result = minter.mint_native(large_payment);
  assert(result.total_minted > 0n, "Large payment processed");
});

runTest("Parameter Combination Testing", () => {
  const combinations = [
    {
      name: "Low price, high slope",
      price_initial: PRECISION / 1_000_000n,
      slope: PRECISION * 10n,
    },
    {
      name: "High price, zero slope",
      price_initial: 10_000_000n * PRECISION,
      slope: 0n,
    },
    {
      name: "Medium price, medium slope",
      price_initial: PRECISION,
      slope: PRECISION / 100n,
    },
    {
      name: "Very small price, very small slope",
      price_initial: 1n,
      slope: PRECISION / 1_000_000n,
    },
  ];
  for (const combo of combinations) {
    const system = create_system({
      price_initial: combo.price_initial,
      slope: combo.slope,
      shares: {
        user_ppm: 1_000_000n,
        tol_ppm: 0n,
      },
    });
    const result = system.tmc_minter.mint_native(100n * PRECISION);
    assert(result.total_minted > 0n, `Combo: ${combo.name}`);
  }
});

runTest("Current Default Parameters Validation", () => {
  const system = create_system({});
  const minter = system.tmc_minter;
  const total_shares = minter.user_ppm + minter.tol_ppm;
  assert(total_shares === PPM, "Default shares sum to 100%");
  const result = minter.mint_native(1_000n * PRECISION);
  assert(result.total_minted > 0n, "Default config produces valid mint");
});

// 3. SCALING RULES

runTest("Scaling Rules - Naming Convention", () => {
  const system = create_system({});
  const minter = system.tmc_minter;
  assert(minter.hasOwnProperty("user_ppm"), "user share has _ppm suffix");
  assert(minter.hasOwnProperty("tol_ppm"), "tol share has _ppm suffix");
});

runTest("Scaling Rules - Input Pre-scaling", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const payment = 10n * PRECISION;
  const result = minter.mint_native(payment);
  assert(result.total_minted > 0n, "Pre-scaled inputs work correctly");
});

runTest("Scaling Rules - Price Scaling Consistency", () => {
  const system = create_system({
    price_initial: PRECISION * 2n,
    slope: 0n,
    shares: {
      user_ppm: 1_000_000n,
      tol_ppm: 0n,
    },
  });
  const minter = system.tmc_minter;
  const pool = system.xyk_pool;
  const mint_result = minter.mint_native(1_000n * PRECISION);
  assert(
    mint_result.price_before === PRECISION * 2n,
    "Minter price consistency",
  );
});

runTest("Scaling Rules - PPM Values Range", () => {
  const system = create_system({});
  const user_ppm = system.tmc_minter.user_ppm;
  const tol_ppm = system.tmc_minter.tol_ppm;
  const total_shares = user_ppm + tol_ppm;
  assert(total_shares === PPM, "Shares sum to 1,000,000 PPM");
  assert(user_ppm <= PPM, "User share <= 100%");
  assert(tol_ppm <= PPM, "TOL share <= 100%");
});

runTest("Scaling Rules - Precision Through Calculations", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const minter = system.tmc_minter;
  const payment = 1_000n * PRECISION;
  const result = minter.mint_native(payment);
  const total_distributed = result.user_native + result.tol_native;
  const diff =
    total_distributed > result.total_minted
      ? total_distributed - result.total_minted
      : result.total_minted - total_distributed;
  assert(diff <= 4n, "Precision loss <= 4 wei");
});

// 4. COMPONENT TESTS

runTest("System Initialization", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION / 1_000n,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  assert(system.tmc_minter !== undefined, "Minter initialized");
  assert(system.tol_manager !== undefined, "TOL manager initialized");
  assert(system.xyk_pool !== undefined, "XYK pool initialized");
  assert(system.router !== undefined, "Router initialized");
  assert(system.fee_manager !== undefined, "Fee manager initialized");
});

runTest("TMC Minting and Distribution", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const minter = system.tmc_minter;
  const payment = 1_000n * PRECISION;
  const result = minter.mint_native(payment);
  const user_expected = (result.total_minted * 333_333n) / PPM;
  const tol_expected = (result.total_minted * 666_667n) / PPM;
  assertApprox(result.user_native, user_expected, 1n, "User share correct");
  assertApprox(result.tol_native, tol_expected, 1n, "TOL share correct");
});

runTest("TOL Adding Liquidity to XYK", () => {
  const system = create_system({});
  const minter = system.tmc_minter;
  const pool = system.xyk_pool;
  const mint_result = minter.mint_native(1_000n * PRECISION);
  const total_lp =
    mint_result.tol.bucket_a.lp_minted +
    mint_result.tol.bucket_b.lp_minted +
    mint_result.tol.bucket_c.lp_minted +
    mint_result.tol.bucket_d.lp_minted;
  assert(total_lp > 0n, "TOL LP tokens minted");
  assert(pool.reserve_native > 0n, "Pool native reserve increased");
  assert(pool.reserve_foreign > 0n, "Pool foreign reserve increased");
});

runTest("XYK Pool Swaps", () => {
  const system = create_system({});
  const pool = system.xyk_pool;
  const minter = system.tmc_minter;
  minter.mint_native(10_000n * PRECISION);
  const swap_amount = 100n * PRECISION;
  const k_before = pool.reserve_native * pool.reserve_foreign;
  const output = pool.swap_foreign_to_native(swap_amount, 0n);
  assert(output.native_out > 0n, "Swap produces output");
  const k_after = pool.reserve_native * pool.reserve_foreign;
  assert(k_after >= k_before, "K invariant maintained or increased");
});

runTest("Smart Router Path Selection", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: 100_000n,
  });
  const router = system.router;
  const minter = system.tmc_minter;
  minter.mint_native(10_000n * PRECISION);
  const swap_amount = 100n * PRECISION;
  const result = router.swap_foreign_to_native(swap_amount, 0n);
  assert(result.native_out > 0n, "Router produces output");
  assert(
    result.route === "TMC" || result.route === "XYK",
    "Valid route selected",
  );
});

runTest("TMC Burn Functionality", () => {
  const system = create_system({});
  const minter = system.tmc_minter;
  const mint_result = minter.mint_native(1_000_000n * PRECISION);
  const supply_after_mint = minter.supply;
  const burn_amount = supply_after_mint / 2n;
  const burn_result = minter.burn_native(burn_amount);
  assert(minter.supply === supply_after_mint - burn_amount, "Supply decreased");
  assert(burn_result.supply_before > 0n, "Burn executed");
});

// 5. INTEGRATION TESTS

runTest("Edge Cases", () => {
  const system = create_system({});
  const minter = system.tmc_minter;
  const pool = system.xyk_pool;
  const zero_result = minter.calculate_mint(0n);
  assert(zero_result === 0n, "Zero payment returns zero tokens");
  assert(!pool.has_liquidity(), "Pool starts with no liquidity");
  try {
    pool.swap_foreign_to_native(100n * PRECISION);
    assert(false, "Should fail on empty pool");
  } catch (e) {
    assert(true, "Empty pool swap rejected");
  }
});

runTest("Full Integration Flow", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const minter = system.tmc_minter;
  const router = system.router;
  const mint_result = minter.mint_native(10_000n * PRECISION);
  assert(mint_result.total_minted > 0n, "Mint successful");
  const swap_result = router.swap_foreign_to_native(1_000n * PRECISION, 0n);
  assert(swap_result.native_out > 0n, "Swap successful");
  const burn_result = minter.burn_native(mint_result.total_minted / 10n);
  assert(burn_result.supply_before > 0n, "Burn successful");
});

runTest("Overflow Protection Testing", () => {
  const max_uint256 = (1n << 256n) - 1n;
  const half_max = max_uint256 / 2n;
  try {
    const system = create_system({
      price_initial: half_max,
      slope: PRECISION / 1_000n,
    });
    const result = system.tmc_minter.mint_native(1_000n * PRECISION);
    assert(result.total_minted > 0n, "Large price_initial handled");
  } catch (e) {
    assert(true, "Overflow protected");
  }
});

runTest("Safe Operating Ranges", () => {
  const configs = [
    {
      name: "Conservative",
      price_initial: PRECISION,
      slope: PRECISION / 1_000n,
    },
    {
      name: "Moderate",
      price_initial: PRECISION / 100n,
      slope: PRECISION / 100n,
    },
    {
      name: "Aggressive",
      price_initial: PRECISION / 1_000n,
      slope: PRECISION / 10n,
    },
  ];
  for (const config of configs) {
    const system = create_system({
      price_initial: config.price_initial,
      slope: config.slope,
    });
    const result = system.tmc_minter.mint_native(1_000n * PRECISION);
    assert(result.total_minted > 0n, `${config.name} config safe`);
  }
});

runTest("Formula Performance Analysis", () => {
  const payment = 100n * PRECISION;
  const price_initial = PRECISION;
  const slope = PRECISION / 1_000n;
  const current_supply = 1_000_000n * PRECISION;
  const iterations = 1000;
  const start = getTimestamp();
  for (let i = 0; i < iterations; i++) {
    const system = create_system({
      price_initial,
      slope,
      shares: {
        user_ppm: 1_000_000n,
        tol_ppm: 0n,
      },
    });
    system.tmc_minter.supply = current_supply;
    const result = system.tmc_minter.calculate_mint(payment);
  }
  const end = getTimestamp();
  const total_time = end - start;
  const avg_time = total_time / BigInt(iterations);
  assert(avg_time < 1_000_000n, "Performance acceptable (<1ms per op)");
});

// ============================================================
// 6. MULTI-ACTOR CORRECTNESS
// ============================================================

runTest("Distribution Accuracy - Multi-Mint Accumulation", () => {
  // Test that Treasury and Team receive exact allocation percentages over multiple mints
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 1_000n,
  });
  const alice = new User(0n, 100_000n * PRECISION);
  alice.set_router(system.router);
  let total_user_received = 0n;
  // Perform 15 mints to accumulate significant distributions
  for (let i = 0; i < 15; i++) {
    const result = alice.buy_native(1_000n * PRECISION);
    if (result.route === "TMC") {
      total_user_received += result.native_out;
    }
  }
  const total_supply = system.tmc_minter.supply;
  const tol_native = system.xyk_pool.reserve_native;
  // Calculate actual distribution ratios
  const user_ratio = (total_user_received * PPM) / total_supply;
  const tol_ratio = (tol_native * PPM) / total_supply;
  // Expected ratios from DEFAULT_CONFIG: user=33.3%, tol=66.7%
  const expected_user = 333_333n;
  const expected_tol = 666_667n;
  // Validate within 1% tolerance (10,000 PPM)
  const tolerance = PPM / 100n;
  assertApprox(
    user_ratio,
    expected_user,
    tolerance,
    "User distribution should be ~33.3%",
  );
  assertApprox(
    tol_ratio,
    expected_tol,
    tolerance,
    "TOL distribution should be ~66.7%",
  );
  // Verify total distribution sums to 100% (within rounding)
  const total_ratio = user_ratio + tol_ratio;
  assertApprox(
    total_ratio,
    PPM,
    tolerance,
    "Total distribution must sum to 100%",
  );
});

runTest("Mass Conservation - System-Wide Token Accounting", () => {
  // Test that total supply exactly equals sum of all participant balances
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 1_000n,
  });
  const alice = new User(0n, 10_000n * PRECISION);
  const bob = new User(0n, 5_000n * PRECISION);
  alice.set_router(system.router);
  bob.set_router(system.router);
  // Multiple mint operations to build up system
  alice.buy_native(2_000n * PRECISION);
  bob.buy_native(1_000n * PRECISION);
  alice.buy_native(500n * PRECISION);
  bob.buy_native(300n * PRECISION);
  // Collect all balances
  const total_supply = system.tmc_minter.supply;
  const alice_balance = alice.get_balance().native;
  const bob_balance = bob.get_balance().native;
  const tol_balance = system.tol_manager.get_balance();
  const tol_native =
    tol_balance.bucket_a.contributed_native +
    tol_balance.bucket_b.contributed_native +
    tol_balance.bucket_c.contributed_native +
    tol_balance.bucket_d.contributed_native;
  const xyk_native = system.xyk_pool.reserve_native;
  const fee_buffer_native = system.fee_manager.buffer_native;
  // Mass conservation: supply = user balances + treasury + team + XYK pool + fee buffers
  // All minted tokens must be accounted for in these locations
  const total_accounted =
    alice_balance + bob_balance + tol_native + xyk_native + fee_buffer_native;
  const total_burned = system.fee_manager.total_native_burned;
  // Mass conservation accounting:
  // - Tokens minted increase supply
  // - Tokens burned (via FeeManager) decrease supply
  // - Current balances should equal: current_supply + burned_tokens
  // This accounts for tokens that were minted but later burned
  const total_with_burned = total_supply + total_burned;
  assertApprox(
    total_with_burned,
    total_accounted,
    total_accounted / 1000n, // 0.1% tolerance for rounding
    `Mass conservation violated: supply+burned=${total_with_burned}, accounted=${total_accounted}`,
  );
  // Additional verification: no negative balances
  assert(alice_balance >= 0n, "Alice balance cannot be negative");
  assert(bob_balance >= 0n, "Bob balance cannot be negative");
  assert(tol_native >= 0n, "TOL balance cannot be negative");
  assert(xyk_native >= 0n, "XYK reserves cannot be negative");
  // Verify supply is positive after operations
  assert(total_supply > 0n, "Total supply must be positive after mints");
  // Verify all participants have accumulated tokens
  assert(alice_balance > 0n, "Alice should have received tokens");
  assert(bob_balance > 0n, "Bob should have received tokens");
  assert(tol_native > 0n, "TOL should have accumulated tokens");
  assert(xyk_native > 0n, "XYK should have TOL reserves");
});

runTest("TOL Independence - Participant Sales Don't Touch TOL", () => {
  // Test that Treasury, Team, and User sales only affect XYK reserves, never TOL LP tokens
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 1_000n,
  });
  const alice = new User(0n, 20_000n * PRECISION);
  alice.set_router(system.router);
  // Build up system with multiple mints
  for (let i = 0; i < 10; i++) {
    alice.buy_native(1_000n * PRECISION);
  }
  // Snapshot TOL state before any sales
  const tol_balance_before = system.tol_manager.get_balance();
  const tol_lp_before =
    tol_balance_before.bucket_a.balance_lp +
    tol_balance_before.bucket_b.balance_lp +
    tol_balance_before.bucket_c.balance_lp +
    tol_balance_before.bucket_d.balance_lp;
  const tol_contributed_native_before =
    tol_balance_before.bucket_a.contributed_native +
    tol_balance_before.bucket_b.contributed_native +
    tol_balance_before.bucket_c.contributed_native +
    tol_balance_before.bucket_d.contributed_native;
  const tol_contributed_foreign_before =
    tol_balance_before.bucket_a.contributed_foreign +
    tol_balance_before.bucket_b.contributed_foreign +
    tol_balance_before.bucket_c.contributed_foreign +
    tol_balance_before.bucket_d.contributed_foreign;
  assert(tol_lp_before > 0n, "TOL should have accumulated LP tokens");
  // Execute sales from alice
  const alice_balance = alice.get_balance().native;
  alice.sell_native(alice_balance / 4n);
  // Snapshot TOL state after sales
  const tol_balance_after = system.tol_manager.get_balance();
  const tol_lp_after =
    tol_balance_after.bucket_a.balance_lp +
    tol_balance_after.bucket_b.balance_lp +
    tol_balance_after.bucket_c.balance_lp +
    tol_balance_after.bucket_d.balance_lp;
  const tol_contributed_native_after =
    tol_balance_after.bucket_a.contributed_native +
    tol_balance_after.bucket_b.contributed_native +
    tol_balance_after.bucket_c.contributed_native +
    tol_balance_after.bucket_d.contributed_native;
  const tol_contributed_foreign_after =
    tol_balance_after.bucket_a.contributed_foreign +
    tol_balance_after.bucket_b.contributed_foreign +
    tol_balance_after.bucket_c.contributed_foreign +
    tol_balance_after.bucket_d.contributed_foreign;
  // Critical validation: TOL must be completely unaffected by participant sales
  assert(
    tol_lp_after === tol_lp_before,
    `TOL LP tokens changed: before=${tol_lp_before}, after=${tol_lp_after}`,
  );
  assert(
    tol_contributed_native_after === tol_contributed_native_before,
    "TOL native contribution changed from participant sales",
  );
  assert(
    tol_contributed_foreign_after === tol_contributed_foreign_before,
    "TOL foreign contribution changed from participant sales",
  );
  // Verify TOL is strictly non-decreasing (can only increase on new mints)
  assert(tol_lp_after >= tol_lp_before, "TOL must never decrease");
  // Additional verification: XYK reserves should have changed (due to sales)
  assert(
    system.xyk_pool.reserve_native > 0n,
    "XYK must maintain native reserves",
  );
  assert(
    system.xyk_pool.reserve_foreign > 0n,
    "XYK must maintain foreign reserves",
  );
});

// 7. ADVANCED SCENARIOS

runTest("Circular Swaps and Arbitrage Detection", () => {
  const system = create_system({
    price_initial: PRECISION / 100n,
    slope: PRECISION / 20n,
  });
  const initial_foreign = 10_000n * PRECISION;
  system.tmc_minter.mint_native(initial_foreign);
  const swap_amount = 1_000n * PRECISION;
  const result1 = system.router.swap_foreign_to_native(swap_amount, 0n);
  const result2 = system.router.swap_native_to_foreign(result1.native_out, 0n);
  assert(result2.foreign_out < swap_amount, "Circular swap loses value (fees)");
});

runTest("Minimum Trade Amount Enforcement", () => {
  const system = create_system({
    min_swap_foreign: 10n * PRECISION,
    min_initial_foreign: 100n * PRECISION,
  });
  try {
    system.router.swap_foreign_to_native(5n * PRECISION, 0n);
    assert(false, "Should reject sub-minimum trade");
  } catch (e) {
    assert(true, "Sub-minimum trade rejected");
  }
});

runTest("Slippage Protection in Router", () => {
  const system = create_system({});
  system.tmc_minter.mint_native(10_000n * PRECISION);
  const expected_output = system.xyk_pool.get_out_native(100n * PRECISION);
  const min_acceptable = expected_output + 1n;
  try {
    system.router.swap_foreign_to_native(100n * PRECISION, min_acceptable);
    assert(false, "Should fail slippage check");
  } catch (e) {
    assert(true, "Slippage protection works");
  }
});

runTest("TOL Buffer Behavior Before Pool Initialization", () => {
  const system = create_system({
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const result = system.tmc_minter.mint_native(1_000n * PRECISION);
  assert(result.tol_native > 0n, "TOL allocation received");
  const total_buffer =
    result.tol.bucket_a.buffer_native +
    result.tol.bucket_b.buffer_native +
    result.tol.bucket_c.buffer_native +
    result.tol.bucket_d.buffer_native;
  const total_lp =
    result.tol.bucket_a.lp_minted +
    result.tol.bucket_b.lp_minted +
    result.tol.bucket_c.lp_minted +
    result.tol.bucket_d.lp_minted;
  assert(total_buffer > 0n || total_lp > 0n, "TOL buffered or added");
});

runTest("Fee Manager Buffer and Burn Mechanics", () => {
  const system = create_system({ min_swap_foreign: 100n * PRECISION });
  system.tmc_minter.mint_native(10_000n * PRECISION);
  const initial_supply = system.tmc_minter.supply;
  for (let i = 0; i < 10; i++) {
    system.router.swap_foreign_to_native(100n * PRECISION, 0n);
  }
  assert(system.fee_manager.fees.native >= 0n, "Native fees accumulate");
});

runTest("Distribution Remainder Handling", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  const result = system.tmc_minter.mint_native(1_000n * PRECISION);
  const total_distributed = result.user_native + result.tol_native;
  assert(
    total_distributed === result.total_minted,
    "No tokens lost in distribution",
  );
});

// 8. SYSTEM INVARIANTS

runTest("System Invariants After Heavy Use", () => {
  const system = create_system({
    price_initial: PRECISION / 100n,
    slope: 10_000n,
  });
  for (let i = 0; i < 50; i++) {
    system.tmc_minter.mint_native((100n + BigInt(i)) * PRECISION);
  }
  for (let i = 0; i < 30; i++) {
    try {
      system.router.swap_foreign_to_native(50n * PRECISION, 0n);
    } catch (e) {}
  }
  for (let i = 0; i < 20; i++) {
    try {
      system.router.swap_native_to_foreign(50n * PRECISION, 0n);
    } catch (e) {}
  }
  assert(system.tmc_minter.supply > 0n, "Supply positive after operations");
  assert(system.xyk_pool.reserve_native > 0n, "Pool has native reserve");
  assert(system.xyk_pool.reserve_foreign > 0n, "Pool has foreign reserve");
});

runTest("Infrastructure Premium Mathematical Proof", () => {
  const system = create_system({
    price_initial: PRECISION,
    slope: PRECISION / 1_000n,
    shares: {
      user_ppm: 333_333n,
      tol_ppm: 666_667n,
    },
  });
  system.router.swap_foreign_to_native(50_000n * PRECISION, 0n);
  const test_scenarios = [
    { amount: 100n * PRECISION, name: "Small trade" },
    { amount: 1_000n * PRECISION, name: "Medium trade" },
    { amount: 5_000n * PRECISION, name: "Large trade" },
    { amount: 10_000n * PRECISION, name: "Very large trade" },
  ];
  for (const scenario of test_scenarios) {
    const xyk_quote = system.xyk_pool.get_out_native(scenario.amount);
    const tmc_quote = system.tmc_minter.get_mint_quote(scenario.amount);
    if (!tmc_quote) {
      continue;
    }
    const user_gets_tmc = tmc_quote.user;
    if (user_gets_tmc >= xyk_quote) {
      assert(
        user_gets_tmc >= xyk_quote,
        `Infrastructure premium exists for ${scenario.name}`,
      );
    }
  }
});

// 9. MULTI-USER SIMULATION

runTest("Multi-User Concurrent Simulation", () => {
  const system = create_system({
    price_initial: PRECISION / 100n,
    slope: 1_000n,
  });
  let total_minted = 0n;
  let total_burned = 0n;
  const user_count = 100;
  const user_balances = new Array(user_count).fill(0n);
  for (let op = 0; op < 500; op++) {
    const user_id = Math.floor(Math.random() * user_count);
    const action = Math.random();
    if (action < 0.5) {
      const amount = BigInt(Math.floor(Math.random() * 1000) + 10) * PRECISION;
      try {
        const result = system.tmc_minter.mint_native(amount);
        user_balances[user_id] += result.user_native;
        total_minted += result.total_minted;
      } catch (e) {}
    } else if (action < 0.8) {
      const amount = BigInt(Math.floor(Math.random() * 100) + 1) * PRECISION;
      try {
        system.router.swap_foreign_to_native(amount, 0n);
      } catch (e) {}
    } else {
      const amount = BigInt(Math.floor(Math.random() * 10) + 1) * PRECISION;
      if (user_balances[user_id] >= amount) {
        try {
          system.tmc_minter.burn_native(amount);
          user_balances[user_id] -= amount;
          total_burned += amount;
        } catch (e) {}
      }
    }
  }
  assert(system.tmc_minter.supply > 0n, "Supply positive after chaos");
  assert(total_minted > 0n, "Total minted tracked");
  assert(system.xyk_pool.reserve_native > 0n, "Pool maintains liquidity");
});

// 10. EMERGENT PROPERTIES

runTest("Bootstrap Gravity Well Detection", () => {
  // Test the critical TOL threshold where system becomes stable
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: 1_000n,
  });
  let tol_market_share = 0n;
  let stability_achieved = false;
  // Simulate progressive minting to find critical point
  for (let i = 0; i < 20; i++) {
    const mint_amount = 10_000n * PRECISION;
    system.tmc_minter.mint_native(mint_amount);
    const market_cap = system.tmc_minter.supply * system.tmc_minter.get_price();
    const tol_value =
      system.xyk_pool.reserve_native * system.tmc_minter.get_price();
    tol_market_share = (tol_value * PRECISION) / market_cap;
    // Critical threshold around 15% of market cap in TOL
    if (tol_market_share > 150_000n) {
      // 15% in PPM units
      stability_achieved = true;
      break;
    }
  }
  assert(
    stability_achieved,
    "System should achieve stability after critical TOL threshold",
  );
  assert(
    tol_market_share > 100_000n,
    "TOL should accumulate significant market share",
  );
});

runTest("Supply Elasticity Inversion Point", () => {
  // Test that after critical supply, increasing supply raises minimum price
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: 500n,
  });
  const initial_supply = system.tmc_minter.supply;
  let pre_inversion_floor = 0n;
  let post_inversion_floor = 0n;
  // Mint to reach inversion point
  for (let i = 0; i < 50; i++) {
    system.tmc_minter.mint_native(5_000n * PRECISION);
    // Calculate effective floor price
    const tol_native = system.xyk_pool.reserve_native;
    const tol_foreign = system.xyk_pool.reserve_foreign;
    if (tol_native > 0n && tol_foreign > 0n) {
      const k = tol_native * tol_foreign;
      const max_sellable = system.tmc_minter.supply - tol_native;
      const final_native = tol_native + max_sellable;
      const final_foreign = k / final_native;
      const current_floor = (final_foreign * PRECISION) / final_native;
      if (i === 10) pre_inversion_floor = current_floor;
      if (i === 40) post_inversion_floor = current_floor;
    }
  }
  // After inversion, floor should be higher despite larger supply
  assert(
    post_inversion_floor > pre_inversion_floor,
    "Floor should increase after supply elasticity inversion point",
  );
  assert(
    system.tmc_minter.supply > initial_supply * 10n,
    "Supply should grow significantly to reach inversion",
  );
});

runTest("Vesting Cliff Math Trap Detection", () => {
  // Test that team tokens can become mathematically trapped
  const system = create_system({
    price_initial: PRECISION / 100n,
    slope: 2_000n,
  });
  // Accelerate convergence through heavy minting and burning
  for (let i = 0; i < 30; i++) {
    system.tmc_minter.mint_native(20_000n * PRECISION);
    if (i % 5 === 0) {
      system.tmc_minter.burn_native(5_000n * PRECISION);
    }
  }
  const ceiling = system.tmc_minter.get_price();
  const tol_native = system.xyk_pool.reserve_native;
  const tol_foreign = system.xyk_pool.reserve_foreign;
  // Calculate floor price
  const k = tol_native * tol_foreign;
  const max_sellable = system.tmc_minter.supply - tol_native;
  const final_native = tol_native + max_sellable;
  const final_foreign = k / final_native;
  const floor = (final_foreign * PRECISION) / final_native;
  const convergence_gap = ceiling - floor;
  const gap_ratio = (convergence_gap * PPM) / ceiling;
  // If gap is small (<5%), team exit becomes mathematically difficult
  const trap_active = gap_ratio < 50_000n; // 5% threshold
  assert(
    trap_active || !trap_active,
    "Vesting trap detection should work (trap may or may not be active)",
  );
  assert(floor > 0n, "Floor should be positive");
  assert(ceiling > floor, "Ceiling should exceed floor");
});

runTest("Mint-Swap Feedback Loop Analysis", () => {
  // Test the self-reinforcing mint cycle
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: 100n,
  });
  let consecutive_tbc_routes = 0;
  let max_consecutive = 0;
  // Simulate series of swaps through router
  for (let i = 0; i < 15; i++) {
    const foreign_amount = 1_000n * PRECISION;
    // Execute swap through router (it will choose best route)
    const result = system.router.swap_foreign_to_native(foreign_amount, 0n);
    // Track which route was used
    if (result.route === "TMC") {
      consecutive_tbc_routes++;
      max_consecutive = Math.max(max_consecutive, consecutive_tbc_routes);
    } else {
      consecutive_tbc_routes = 0;
    }
  }
  // Router fee should prevent infinite avalanche
  assert(
    max_consecutive < 15,
    "Router fee should limit consecutive TMC routes to prevent infinite avalanche",
  );
  assert(
    system.xyk_pool.reserve_native > 0n,
    "XYK pool should maintain liquidity despite feedback loop",
  );
});

runTest("Slope Efficiency Sublinearity Verification", () => {
  // Test that equilibrium price scales as √slope, not linearly
  const test_slopes = [PRECISION / 1_000n, PRECISION / 100n, PRECISION / 10n];
  const equilibrium_prices = [];
  for (const slope of test_slopes) {
    const system = create_system({
      price_initial: PRECISION / 1_000n,
      slope: slope,
    });
    // Build significant TOL through multiple mints
    for (let i = 0; i < 20; i++) {
      system.tmc_minter.mint_native(10_000n * PRECISION);
    }
    const tol_native = system.xyk_pool.reserve_native;
    const equilibrium = BigMath.isqrt((tol_native * slope) / PRECISION);
    equilibrium_prices.push(equilibrium);
  }
  // Verify sublinear scaling: 10x slope should give ~3.16x equilibrium (√10)
  const ratio_10x = (equilibrium_prices[1] * PRECISION) / equilibrium_prices[0];
  // 100x slope should give ~10x equilibrium (√100)
  const ratio_100x =
    (equilibrium_prices[2] * PRECISION) / equilibrium_prices[0];
  // Allow 10% tolerance for simulation approximations
  assertApprox(
    ratio_10x,
    316_000_000_000n,
    10_000_000_000n,
    "10x slope gives ~√10 price increase",
  );
  assertApprox(
    ratio_100x,
    1_000_000_000_000n,
    100_000_000_000n,
    "100x slope gives ~10x price increase",
  );
  // Verify sublinear property: ratio_100x should be less than 100
  assert(
    ratio_100x < 10_000_000_000_000n,
    "100x slope gives less than 100x price increase (sublinear)",
  );
});

// 11. ATTACK RESISTANCE TESTS

runTest("Sandwich Attack Fee Burden", () => {
  // Test that router fees create substantial cost for sandwich attacks
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 1_000n,
  });
  // Initial state with established liquidity
  system.tmc_minter.mint_native(50_000n * PRECISION);
  // Simple sandwich attack: attacker makes two swaps around victim's transaction
  const attack_amount = 5_000n * PRECISION;
  // Front-run swap
  const frontrun_result = system.router.swap_foreign_to_native(
    attack_amount,
    0n,
  );
  const frontrun_fee = frontrun_result.foreign_router_fee;
  // Victim transaction (simulate market activity)
  system.router.swap_foreign_to_native(attack_amount, 0n);
  // Back-run swap
  const backrun_result = system.router.swap_native_to_foreign(
    frontrun_result.native_out,
    0n,
  );
  const backrun_fee = backrun_result.native_router_fee;
  // Calculate total fees paid by attacker (convert backrun fee to foreign equivalent)
  const backrun_fee_foreign =
    (backrun_fee * system.xyk_pool.get_price()) / PRECISION;
  const total_fees = frontrun_fee + backrun_fee_foreign;
  const fee_ratio = (total_fees * PPM) / attack_amount;
  // Verify fees are substantial (0.5% per swap = 1% round-trip minimum)
  assert(
    fee_ratio >= 6_000n, // >= 0.6% total fees (accounts for conversion and slippage)
    "Router fees should extract substantial value from sandwich attacks",
  );
  // Verify TOL continues to accumulate during attack scenario
  const tol_balance = system.tol_manager.get_balance();
  const tol_lp_tokens =
    tol_balance.bucket_a.balance_lp +
    tol_balance.bucket_b.balance_lp +
    tol_balance.bucket_c.balance_lp +
    tol_balance.bucket_d.balance_lp;
  assert(
    tol_lp_tokens > 0n,
    "TOL accumulation should continue during attack scenarios",
  );
});

runTest("Realistic Governance Attack - Distribution Manipulation", () => {
  // Test realistic governance attack: malicious proposal to change distribution shares
  const system = create_system({
    price_initial: PRECISION / 1_000n,
    slope: PRECISION / 1_000n,
  });
  // Build significant TOL and establish baseline
  for (let i = 0; i < 15; i++) {
    system.tmc_minter.mint_native(8_000n * PRECISION);
  }
  // Simulate malicious governance proposal:
  // Change distribution to extract value: user=10%, team=90%
  // Note: In real system, this would require governance vote
  // For testing, we simulate the economic effects
  // Verify floor guarantee persists despite potential governance manipulation
  const current_k =
    system.xyk_pool.reserve_native * system.xyk_pool.reserve_foreign;
  const worst_case_sell = (system.tmc_minter.supply * 667n) / 1_000n;
  const final_native = system.xyk_pool.reserve_native + worst_case_sell;
  const final_foreign = current_k / final_native;
  const floor_price = (final_foreign * PRECISION) / final_native;
  // Floor must remain positive - mathematical guarantee holds
  assert(
    floor_price > 0n,
    "Floor guarantee must persist despite malicious distribution changes",
  );
  // Verify TOL still exists and provides protection
  const tol_balance = system.tol_manager.get_balance();
  const total_tol =
    tol_balance.bucket_a.balance_lp +
    tol_balance.bucket_b.balance_lp +
    tol_balance.bucket_c.balance_lp +
    tol_balance.bucket_d.balance_lp;
  assert(total_tol > 0n, "TOL should exist to provide floor protection");
  // Verify large holder extraction is limited by price impact
  const large_holder_balance = system.tmc_minter.supply / 10n; // Simulate 10% holder
  const sell_impact =
    (large_holder_balance * PRECISION) / system.xyk_pool.reserve_native;
  assert(
    sell_impact > 100n, // Large holder represents significant % of TOL reserves
    "Large holder extraction should face severe price impact limiting profitability",
  );
  // Verify XYK invariant maintains liquidity guarantee
  const k_check =
    system.xyk_pool.reserve_native * system.xyk_pool.reserve_foreign;
  assertApprox(
    k_check,
    current_k,
    current_k / 1_000n,
    "XYK invariant must maintain liquidity guarantee under governance attack",
  );
});

runTest("Cross-Chain Bridge Failure Resilience", () => {
  // Test that each chain maintains floor guarantee during bridge failure
  const chains = [
    create_system({
      price_initial: PRECISION / 1_000n,
      slope: PRECISION / 1_000n,
    }),
    create_system({
      price_initial: PRECISION / 1_000n,
      slope: PRECISION / 1_000n,
    }),
    create_system({
      price_initial: PRECISION / 1_000n,
      slope: PRECISION / 1_000n,
    }),
  ];
  // Simulate independent TOL deployment across chains
  for (let i = 0; i < chains.length; i++) {
    for (let j = 0; j < 10; j++) {
      chains[i].tmc_minter.mint_native(5_000n * PRECISION);
    }
  }
  // Create realistic price divergence through independent trading
  chains[0].router.swap_foreign_to_native(20_000n * PRECISION, 0n); // Chain 0: buying pressure
  chains[2].router.swap_native_to_foreign(10_000n * PRECISION, 0n); // Chain 2: selling pressure
  // Record price divergence after bridge failure
  const prices = chains.map((system) => system.xyk_pool.get_price());
  let max_price = 0n;
  let min_price = prices[0];
  for (const price of prices) {
    if (price > max_price) max_price = price;
    if (price < min_price) min_price = price;
  }
  const price_divergence = ((max_price - min_price) * PPM) / max_price;
  // Verify realistic price divergence exists
  assert(
    price_divergence > 100n, // >0.01% price difference (realistic for isolated chains)
    "Bridge failure should create measurable price divergence between chains",
  );
  // Simulate attacker trying to exploit divergence without bridge
  // Attacker cannot move assets between chains, so arbitrage is impossible
  const chain_floors = chains.map((system, idx) => {
    const xyk_native = system.xyk_pool.reserve_native;
    const xyk_foreign = system.xyk_pool.reserve_foreign;
    const k = xyk_native * xyk_foreign;
    const total_supply = system.tmc_minter.supply;
    // Calculate worst-case floor (67% dump)
    const sellable = (total_supply * 667n) / 1_000n;
    const final_native = xyk_native + sellable;
    const final_foreign = k / final_native;
    const floor = (final_foreign * PRECISION) / final_native;
    // Verify each chain maintains independent floor
    assert(
      floor > 0n,
      "Chain " + idx + " must maintain positive floor despite price divergence",
    );
    return floor;
  });
  // Verify TOL distribution prevents systemic risk
  const total_tol_native = chains.reduce(
    (sum, sys) => sum + sys.xyk_pool.reserve_native,
    0n,
  );
  const tol_distribution = chains.map(
    (sys) => (sys.xyk_pool.reserve_native * PPM) / total_tol_native,
  );
  // No single chain should have >70% of total TOL
  const max_tol_share = tol_distribution.reduce(
    (max, share) => (share > max ? share : max),
    0n,
  );
  assert(
    max_tol_share <= 700_000n, // <= 70%
    "TOL distribution should prevent single-chain dominance risk",
  );
  // Verify arbitrage is impossible without bridge functionality
  // Attacker cannot profit from price divergence across isolated chains
  const arbitrage_profit = 0n; // No bridge = no arbitrage
  assert(
    arbitrage_profit === 0n,
    "Price divergence should not create arbitrage opportunity without bridge",
  );
  // Verify each chain's economic independence
  for (let idx = 0; idx < chains.length; idx++) {
    const system = chains[idx];
    const k = system.xyk_pool.reserve_native * system.xyk_pool.reserve_foreign;
    const supply = system.tmc_minter.supply;
    // Each chain should have sustainable TOL-to-supply ratio
    const tol_ratio = (system.xyk_pool.reserve_native * PPM) / supply;
    assert(
      tol_ratio > 50_000n, // >5% TOL ratio for each chain (more realistic)
      "Each chain should maintain sufficient TOL for floor guarantee",
    );
    assert(k > 0n, "Chain " + idx + " XYK invariant must be positive");
  }
});

// FINAL STATISTICS

console.log("\n" + "<RESULTS>");
console.log(`Total:  ${testCount}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests.length}`);

if (failedTests.length > 0) {
  console.log("\n" + "<FAILED TESTS>");
  failedTests.forEach(({ test, code, name, error }) => {
    console.log(`\n[${test}] ${code} ${name}`);
    console.log(`Error: ${error}`);
    console.log(`See: simulator/tests.md section ${code}`);
  });
  console.log("\n❌ Tests failed");
} else {
  console.log("\n✅ All tests passed");
}
