# TMCTOL Tests Mirror

- `Version:` 1.0.0 (November 2025)
- `Architecture:` TOL Multi-Bucket (2-way distribution: User 33.3% + TOL 66.6%)

Comprehensive test suite detalization synchronized with `/simulator/tests.js`

---

## Test Structure Overview

- Total Tests: 45
- Purpose: Formal verification of TMCTOL mathematical guarantees, component behavior, and emergent properties
- Methodology: Boundaries → Precision → Integration → Multi-user flows → Emergent properties

---

## 1. Formula Tests

Mathematical correctness of core pricing and minting algorithms.

### 1.1 Absolute Slope Formula Verification

- Nature: Direct formula validation against specification
- Necessity: Confirms `price = initial_price + slope × supply / PRECISION` holds exactly
- Validates: Linear price progression, zero-supply initial price, correct dimensional scaling
- Failure Criteria: Price calculation deviates from formula by >1 wei

### 1.2 Quadratic Integration for Minting

- Nature: Calculus-based mint amount verification
- Necessity: Proves integral-based token calculation matches theoretical quadratic formula
- Validates: `mint = payment / avg_price` where `avg_price = (price_before + price_after) / 2`
- Failure Criteria: Mint amount error >0.01% from theoretical integral

### 1.3 Zero Slope (Constant Price)

- Nature: Degenerate case where `slope = 0`
- Necessity: Confirms system degrades gracefully to fixed-price model
- Validates: Price independence from supply when slope disabled

---

## 2. Parameter Boundary Tests

Extreme value testing for all configurable parameters.

### 2.1 Initial Price Boundary Testing

- Nature: Tests `price_initial` from 1 wei to millions
- Necessity: Ensures system stability across entire economic range
- Validates: Minimum (1 wei), fractional (0.000001), standard (1.0), extreme (1M+)

### 2.2 Slope Boundary Testing

- Nature: Tests `slope` from 0 to extreme values with PRECISION scaling
- Necessity: Confirms pricing model works for flat, gentle, and aggressive slopes
- Validates: Zero (constant), minimal (0.000001), standard (0.001), high (0.1), extreme (1.0+)

### 2.3 Supply Boundary Testing

- Nature: Tests behavior from zero to billions of tokens
- Necessity: Proves formula stability under hyperscale token economies
- Validates: Empty state, small (1K), medium (1M), large (1B+)

### 2.4 Large Number Stress Test

- Nature: Tests near uint256 maximum values
- Necessity: Prevents overflow vulnerabilities in production
- Validates: 128-bit operations, maximum safe minting amounts

### 2.5 Parameter Combination Testing

- Nature: Tests extreme parameter pairings
- Necessity: Reveals edge cases invisible in isolated testing
- Validates: Low price + high slope, high price + zero slope, etc.

### 2.6 Current Default Parameters Validation

- Nature: Smoke test for production configuration
- Necessity: Ensures DEFAULT_CONFIG represents sane, tested values
- Validates: All defaults produce mathematically valid system state

---

## 3. Scaling Rules

Verification of PPM precision model consistency.

### 3.1 Scaling Rules - Naming Convention

- Nature: Structural test for scaling convention adherence
- Necessity: Enforces self-documenting code pattern
- Validates: Fractional values (fees, shares) use `_ppm` suffix; slope uses PRECISION scaling without suffix

### 3.2 Scaling Rules - Input Pre-scaling

- Nature: Confirms inputs arrive scaled to correct units
- Necessity: Prevents double-scaling bugs
- Validates: Price and slope use PRECISION; amounts use PRECISION; percentages (fees, shares) use PPM

### 3.3 Scaling Rules - Price Scaling Consistency

- Nature: Validates price and slope dimensional consistency
- Necessity: Ensures all price-related calculations maintain [Foreign/Native] × PRECISION scaling
- Validates: Price formula P(s) = P₀ + slope·s/PRECISION produces consistent units

### 3.4 Scaling Rules - PPM Values Range

- Nature: Validates PPM values sum to 1,000,000 (100%)
- Necessity: Prevents distribution math errors
- Validates: Share allocation totals exactly 100%

### 3.5 Scaling Rules - Precision Through Calculations

- Nature: Tests precision loss through calculation chains
- Necessity: Quantifies rounding error accumulation
- Validates: Errors remain within acceptable tolerance (<0.01%)

---

## 4. Component Tests

Isolated validation of individual system components.

### 4.1 System Initialization

- Nature: Tests system factory and component wiring
- Necessity: Confirms dependency injection creates valid state
- Validates: All components initialized, cross-references correct

### 4.2 TMC Minting and Distribution

- Nature: Tests token creation and share allocation
- Necessity: Proves distribution percentages match configuration
- Validates: User/TOL shares exact (33.3%/66.7%), supply increases correctly, TOL manages 4 internal buckets

### 4.3 TOL Adding Liquidity to XYK

- Nature: Tests automatic liquidity provision via Zap
- Necessity: Confirms TOL accumulation mechanism functions
- Validates: LP tokens minted, reserves increased, ratios preserved

### 4.4 XYK Pool Swaps

- Nature: Tests constant-product AMM formula
- Necessity: Validates `x × y = k` invariant preservation
- Validates: Swap calculations, fee collection, reserve updates

### 4.5 Smart Router Path Selection

- Nature: Tests TMC vs XYK price comparison logic
- Necessity: Ensures users always receive optimal price
- Validates: Cheaper path chosen, tie-breaking to TMC

### 4.6 TMC Burn Functionality

- Nature: Tests token destruction and supply reduction
- Necessity: Confirms deflationary mechanics work correctly
- Validates: Supply decreases, price calculated before burn

---

## 5. Integration Tests

Multi-component workflows simulating real usage.

### 5.1 Edge Cases

- Nature: Tests degenerate inputs and empty states
- Necessity: Prevents division-by-zero and null-pointer equivalents
- Validates: Zero amounts, empty pools, first mint handled gracefully

### 5.2 Full Integration Flow

- Nature: Complete user journey: mint → swap → burn
- Necessity: Reveals interaction bugs invisible in unit tests
- Validates: End-to-end flow produces consistent state
- Failure Criteria: State inconsistency, balance mismatch, or operation failure

### 5.3 Overflow Protection Testing

- Nature: Tests near-maximum uint256 operations
- Necessity: Critical for preventing financial exploits
- Validates: Safe multiplication, no silent overflows
- Failure Criteria: Overflow occurs or result wraps around

### 5.4 Safe Operating Ranges

- Nature: Identifies practical parameter boundaries
- Necessity: Establishes production deployment guidelines
- Validates: Conservative/moderate/aggressive configs all safe

### 5.5 Formula Performance Analysis

- Nature: Benchmarks quadratic formula execution time
- Necessity: Ensures on-chain feasibility (gas costs)
- Validates: Sub-millisecond performance at scale

---

## 6. Multi-Actor Correctness

Validation of participant classes (User, Treasury, Team) integration with core tokenomics. Actual distribution is User + TOL (with 4 internal buckets).

### 6.1 Distribution Accuracy - Multi-Mint Accumulation

- Nature: Economic correctness verification across multiple minting operations
- Necessity: Validates exact distribution percentages (33.3% user, 66.7% TOL) hold over time
- Validates: TOL receives precise allocation through `receive_mint_allocation()` and distributes to 4 internal buckets (50%, 16.67%, 16.67%, 16.67%); distribution ratios remain constant regardless of mint count; rounding errors remain within tolerance (<1%)
- Failure Criteria: Distribution ratio deviates >1% from configured shares; accumulation mechanism fails; TOL bucket balances incorrect

### 6.2 Mass Conservation - System-Wide Token Accounting

- Nature: Fundamental conservation law for token supply
- Necessity: Proves tokens cannot be created or destroyed outside designed mechanisms (minting, TOL lock)
- Validates: Total supply exactly equals user balances + TOL reserves (across all 4 buckets); no tokens lost to rounding; supply tracking remains consistent across all operations
- Failure Criteria: Supply mismatch >1 wei; tokens disappear or appear unexpectedly; balance sum ≠ total supply

### 6.3 TOL Independence - Participant Sales Don't Touch TOL

- Nature: Security property ensuring TOL permanence
- Necessity: Confirms TOL liquidity remains locked regardless of participant trading activity
- Validates: User sales only affect XYK reserves, not TOL LP tokens; TOL balance strictly non-decreasing (only increases on new mints); each of 4 TOL buckets maintains independent LP balances
- Failure Criteria: TOL LP balance decreases; user sales affect TOL allocation; TOL buckets become accessible to users

---

## 7. Advanced Scenarios

Complex economic behaviors and attack vectors.

### 7.1 Circular Swaps and Arbitrage Detection

- Nature: Tests round-trip swap profitability
- Necessity: Proves system resistant to risk-free arbitrage
- Validates: Fees prevent circular profit, price convergence observed

### 7.2 Minimum Trade Amount Enforcement

- Nature: Tests trade size restrictions
- Necessity: Prevents dust attacks and spam
- Validates: Sub-minimum trades rejected, error messages clear

### 7.3 Slippage Protection in Router

- Nature: Tests `min_output` parameter enforcement
- Necessity: Protects users from front-running attacks
- Validates: Insufficient output reverts transaction

### 7.4 TOL Buffer Behavior Before Pool Initialization

- Nature: Tests TOL accumulation when pool doesn't exist
- Necessity: Ensures smooth cold-start without liquidity
- Validates: Buffer holds tokens, flushes on pool creation

### 7.5 Fee Manager Buffer and Burn Mechanics

- Nature: Tests fee accumulation and threshold-based burning
- Necessity: Confirms deflationary mechanism activates correctly
- Validates: Fees buffered, burned when threshold reached

### 7.6 Distribution Remainder Handling

- Nature: Tests rounding remainder allocation to TOL
- Necessity: Prevents dust loss from fractional PPM in 2-way split (user 33.3% + TOL 66.7%)
- Validates: Total distributed matches minted exactly

---

## 8. System Invariants

Mathematical guarantees that must never break.

### 8.1 System Invariants After Heavy Use

- Nature: Tests conservation laws after 1000+ operations
- Necessity: Proves system stability under production load
- Validates:

* Total supply = sum of all balances
* XYK invariant `k` only increases (fees)
* TOL never decreases (locked forever)
* Price boundaries hold (floor ≤ market ≤ ceiling)

### 8.2 Infrastructure Premium Mathematical Proof

- Nature: Proves users receive more tokens via TMC than XYK
- Necessity: Validates "protocol arbitrage, not user taxation" claim
- Validates: TMC allocation > hypothetical XYK allocation for same payment

---

## 9. Multi-User Simulation

Emergent behavior from concurrent interactions.

### 9.1 Multi-User Concurrent Simulation

- Nature: Simulates 100 random users, 500+ operations
- Necessity: Reveals emergent properties invisible in isolated tests
- Validates:

* Conservation laws under chaos
* Price ratchet acceleration (floor rises)
* Deflation acceleration (burning compounds)
* System stability (no deadlocks/livelocks)

- Failure Criteria: Conservation error >0.01%, TOL balance reduction, XYK constant k decreases, system deadlock
- Key Insight: Multi-user flows expose state interactions that unit tests cannot predict.

---

## 10. Emergent Properties Validation

Tests for system behaviors that emerge from component interactions but are not explicitly designed.

### 10.1 Bootstrap Gravity Well Detection

- Nature: Critical TOL accumulation threshold validation
- Necessity: Identifies the point where system transitions from fragile to stable
- Validates: System achieves stability when TOL value exceeds ~15% of market capitalization
- Failure Criteria: System remains unstable despite significant TOL accumulation

### 10.2 Supply Elasticity Inversion Point

- Nature: Tests the counterintuitive property where increasing supply raises minimum price
- Necessity: Validates TMCTOL's unique economic behavior that inverts traditional supply-demand dynamics
- Validates: After critical supply level, floor price increases despite supply expansion
- Failure Criteria: Traditional supply-demand relationship persists (more supply → lower price)

### 10.3 Vesting Cliff Math Trap Detection

- Nature: Tests mathematical lock-in of large holder tokens during convergence
- Necessity: Confirms price impact creates natural exit difficulty
- Validates: Large holder tokens (e.g., 10%+ of supply) become mathematically difficult to exit when floor approaches ceiling
- Failure Criteria: Large holders can exit significant positions without severe price impact during convergence

### 10.4 Mint-Swap Feedback Loop Analysis

- Nature: Tests self-reinforcing cycle where TMC mints degrade XYK prices
- Necessity: Validates router fee effectiveness in preventing infinite mint avalanches
- Validates: Router fees (0.5%) create sufficient friction to limit consecutive TMC routes
- Failure Criteria: Unlimited consecutive TMC routes create price manipulation vulnerability

### 10.5 Slope Efficiency Sublinearity Verification

- Nature: Tests that equilibrium price scales as √slope, not linearly
- Necessity: Validates diminishing returns from slope parameter increases
- Validates: 10x slope increase gives ~3.16x equilibrium price (√10), 100x slope gives ~10x price (√100)
- Failure Criteria: Linear scaling observed (10x slope gives 10x price)

---

## 11. Attack Resistance Tests

Validation of system security against economic attack vectors with realistic scenarios.

### 11.1 Sandwich Attack Fee Burden

- Nature: Tests that router fees make sandwich attacks economically inefficient through fee extraction
- Necessity: Validates that 0.5% router fee per swap creates sufficient friction to deter profitable MEV extraction
- Validates: Total fees exceed 0.8% of attack capital for round-trip; attacker profit margin minimal (<0.1%); TOL accumulation continues during attack scenarios
- Failure Criteria: Fees insufficient to deter attacks; attacker achieves significant profit; TOL accumulation disrupted

### 11.2 Realistic Governance Attack - Distribution Manipulation

- Nature: Tests realistic governance attack where malicious proposal changes distribution shares to extract value
- Necessity: Confirms that mathematical floor guarantee persists even under extreme governance manipulation
- Validates: Floor guarantee maintains despite extreme governance scenarios; TOL continues accumulating across all 4 buckets; large holder extraction faces severe price impact (>100% of TOL reserves); XYK invariant maintains liquidity guarantee
- Failure Criteria: Floor guarantee compromised; large holders can extract value without severe price impact; TOL accumulation stops

### 12.0 Cross-Chain Bridge Failure Resilience

- Nature: Tests that each chain maintains floor guarantee during bridge failure with realistic price divergence
- Necessity: Validates independent economic security of each chain when cross-chain communication is disrupted
- Validates: Each chain maintains positive floor despite >0.1% price divergence; TOL distribution prevents single-chain dominance; arbitrage impossible without bridge; each chain maintains sustainable TOL-to-supply ratio (>5%)
- Failure Criteria: Any chain loses floor guarantee; price divergence creates arbitrage opportunity; single chain dominates TOL

---

## Test Execution

```bash
deno ./simulator/tests.js
```

- Expected Output: Minimal statistics, error codes only for failures
- Tolerance: ~0.01% for emergent behaviors (multi-step calculations)
- Coverage: 35 tests validating 6 system layers across 2312 lines
- Documentation Standard: Each test includes Nature/Necessity/Validates/Failure Criteria

---

## Synchronization Protocol

1. Add Test: Update both `tests.js` implementation and this `tests.md` documentation with all four fields (Nature/Necessity/Validates/Failure Criteria)
2. Modify Test: Sync all four fields to match new behavior
3. Remove Test: Delete from both files, update test count in overview
4. Refactor: Maintain test ID stability for historical comparison

---

## Quality Metrics

- Boundary Coverage: 6 tests across all parameter extremes
- Precision Validation: 5 tests for calculation accuracy
- Integration Depth: 5 tests for multi-component flows
- Multi-Actor Correctness: 3 tests for participant class integration
- Advanced Scenarios: 6 tests for complex economic behaviors
- Invariant Proofs: 2 tests for mathematical guarantees
- Chaos Testing: 1 comprehensive multi-user simulation
- Emergent Properties: 5 tests for system behavior analysis
- Attack Resistance: 3 tests for realistic economic attack scenarios
- Philosophy: Tests prove specifications; specifications guide implementation; implementation validates mathematics.

---

## Test Codes Reference

- Each test has a hierarchical code based on its section and position:

* `1.1-2.0`: Formula Tests
* `2.1-2.6`: Parameter Boundary Tests
* `3.1-3.5`: Scaling Rules
* `4.1-4.6`: Component Tests
* `5.1-5.5`: Integration Tests
* `6.1-6.3`: Multi-Actor Correctness
* `7.1-7.6`: Advanced Scenarios
* `8.1-8.2`: System Invariants
* `9.1`: Multi-User Simulation
* `10.1-10.5`: Emergent Properties Validation
* `11.1-12.0`: Attack Resistance

- Use these codes in error messages for quick reference to this documentation.
