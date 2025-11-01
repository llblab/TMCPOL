# TMCTOL Changelog

All notable changes to the TMCTOL (Token Minting Curve + Treasury-Owned Liquidity) framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.0.0] - 2025-11-01

### Added

#### Core Framework

- `Consolidated Specification`: Unified `tmctol.en.md` integrating Foundation → Architecture → Mathematics → Economics → Dynamics → Implementation → Trade-offs
- `L2 TOL Governance`: Constant protection model with declining voting power (10x → 1x linear decay for direct holders)
- `Invoice Voting Mechanics`: DOUBLE/APPROVE/REDUCE/VETO voting system with binary VETO threshold (>50% blocks)
- `Axial Router Specification`: Comprehensive routing gateway with fee burning and price discovery
- `Emergent Properties Documentation`: Bootstrap gravity well (~15% TOL/market-cap stability threshold), supply elasticity inversion, price ratchet effect
- `Dimensional Type System`: Physical types encoding units (`Price [Foreign/Native]`, `Slope [Foreign/Native²]`) preventing categorical errors

#### Mathematical Guarantees

- `Fee Consistency Principle`: XYK quote and execution apply fees identically using "fee on input" model (amount_in × (1 - fee)); prevents routing logic breakage when fees activated from default zero
- `Fair Rounding Strategy`: Largest remainder method eliminates systematic distribution bias; remainder allocated to party with maximum fractional part
- `Internal Slippage Protection`: Fee manager foreign→native conversion uses 10% slippage tolerance; prevents price manipulation attacks on burn mechanism with graceful degradation (buffering)
- `XYK Constant Product Necessity`: Validated that constant product (x·y=k) guarantees liquidity at all price levels; XYK "inefficiency" is precisely its strength for floor protection

#### Testing & Validation

- `Simulator as Ground Truth`: JavaScript/BigInt formal verification environment defining implementation truth (54 comprehensive tests)
- `Structural Symmetry Testing`: RADB (Recursive Abstraction Decomposition) test organization mirroring system architecture
- `Economic Attack Simulation`: Governance resilience, cross-chain independence, sandwich attack resistance scenarios
- `Legitimacy Phase Documentation`: Academic rigor with conditional guarantees throughout entire specification

#### Architectural Patterns

- `Architectural Refactoring Patterns`: New section 6.9 in AGENTS.md documenting symmetry violations, rounding bias, YAGNI in architecture, state ownership questions, distribute-collect anti-pattern, return value redundancy, and single source of truth
- `Buffer Ownership Clarity`: Documented principle that buffers live where concepts live—Tol buffer (awaiting zap) vs Bucket LP (owned liquidity)
- `Method Return Minimalism`: Principle that methods should return only what callers actually use; side-effect methods returning detailed decomposition create redundancy when state is directly queryable
- `Layered Abstraction Insights`: Cognitive scaffolding patterns for progressive comprehension

---

_Changelog maintained according to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standards._
