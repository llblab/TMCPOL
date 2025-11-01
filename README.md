# `TMCTOL`: Token Minting Curve + Treasury-Owned Liquidity

A tokenomics framework with mathematically guaranteed price boundaries through permanent liquidity accumulation. Transforms unlimited downside risk into calculable bounded risk.

## Key Features

### Price Boundaries

- `Ceiling`: Linear progression via minting curve
- `Floor`: Permanent XYK liquidity
- `Worst-case`: 11%-25% of ceiling depending on buckets utilization

### Self-Reinforcing System

- `Price Ratchet`: Growth raises floor and ceiling
- `Bidirectional Compression`: Burning lowers ceiling, TOL raises floor
- `Automatic Liquidity`: 66.6% of mints locked in TOL

### Security

- `No Rug Pull`: Treasury-held LP tokens
- `Infrastructure Premium`: Protocol arbitrage benefits users
- `Deflation`: 0.5% router fees buyback & burn Native token

## How It Works

### Core Components

1. `TMC`: Unidirectional minting with linear price growth
2. `TOL`: Permanent XYK liquidity from mints
3. `Axial Router`: Routes to best price with fee burning

### Mathematical Guarantees

```rust
// TMC Ceiling
let ceiling = initial_price + (slope × total_supply / PRECISION);

// XYK floor
let k = TOL_native * TOL_foreign;
let floor_price = k / (TOL_native + tokens_sold)²;
```

## Getting Started

### For Researchers

- [Specification](./docs/tmctol.en.md) - Framework foundation and core concepts
- [L2 TOL](./docs/l2-tol.en.md) - Second-order organizations with autonomous liquidity
- [Axial Router](./docs/axial-router.en.md) - Cross-organization routing mechanics

### Simulator & Validation

- [Model](./simulator/model.js) - Tokenomics implementation
- [Tests](./simulator/tests.js) - 45 test cases validating system guarantees
- [Test Documentation](./simulator/tests.md) - Detailed test case descriptions

Run tests:

```bash
deno run ./simulator/tests.js
```
