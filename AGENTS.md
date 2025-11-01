# Project Context

## Meta-Protocol Principles

Living protocol for continuous self-improvement and knowledge evolution:

- `Boundary Clarity`: Meta-principles govern context evolution; project conventions govern domain specification; self-improvement mechanisms must never contaminate project-specific documentation
- `Layered Abstraction`: Protocol level ≠ project level; each maintains distinct evolutionary pathways; abstraction layers create cognitive firewalls preventing conceptual contamination
- `Domain Purity`: Project conventions reflect actual domain (tokenomics, bonding curves, liquidity mechanisms); preserve distinction between "how we document" vs "what we document"
- `Evolutionary Feedback`: Protocol improvements inform but never override project architectural decisions; feedback loops create emergent intelligence from accumulated experience
- `Reflexive Integrity`: The context models the separation it mandates between protocol and project layers; system embodies its own design principles through recursive application
- `Emergent Elegance`: Solutions require multiple iterations—initial working code reveals constraints guiding toward elegant patterns; complexity reduction emerges from constraint understanding, not premature simplification
- `Progressive Enhancement`: When existing work approaches excellence (95%+), targeted additions beat wholesale replacement—respect foundational quality; recognize when incremental improvement surpasses architectural revolution
- `Knowledge Lifecycle Management`: Context accumulates knowledge requiring periodic garbage collection—consolidate overlapping concepts by cognitive function, transform tactical details into strategic guidance; garbage collection is proactive evolution, not technical debt
- `Emergent Property Validation`: System behaviors arising from component interactions require explicit testing and documentation—these are not bugs but features of complex systems; emergent behaviors signal system maturity, not design flaws
- `Structural Symmetry`: Test organization should mirror system architecture—optimal structure emerges from understanding behavioral patterns, not arbitrary categorization; conceptual integrity between tests and system design creates multiplicative quality improvements
- `Morphological-First Decision Making`: Analyze solution space dimensions before implementing—map extremes, identify trade-offs, document evolution triggers; systematic pattern recognition enables surgical refactoring; understand change shape before executing change
- `Specification Maturity`: Documentation evolves from exploratory drafts to consolidated truth—when analysis matures into specification, satellite documents merge into canonical source; mathematical foundations belong in core specification, not auxiliary files; code examples illustrate but simulators define implementation truth
- `Cognitive Scaffolding`: Complex systems require layered understanding—build conceptual frameworks that support progressive comprehension without overwhelming; each abstraction layer should enable deeper insight into the next
- `Constraint-Driven Evolution`: System evolution follows constraint discovery—each iteration reveals new boundaries that guide subsequent refinement; constraints are not limitations but evolutionary catalysts
- `Interface Boundary Testing`: Meta-protocol interfaces must withstand rigorous boundary testing—validate that abstraction layers maintain integrity under conceptual stress; boundary failures reveal architectural weaknesses

---

## 10. Layered Abstraction Insights

### 10.1 Cognitive Architecture Patterns

- `Progressive Comprehension`: Complex systems require staged understanding—each layer should build upon previous without overwhelming; cognitive scaffolding enables deeper insight through structured learning pathways
- `Abstraction Firewalls`: Clear boundaries between abstraction layers prevent conceptual contamination; meta-protocol principles govern evolution while project conventions handle domain specifics
- `Constraint Discovery`: Each iteration reveals new system boundaries that guide subsequent refinement; constraints are evolutionary catalysts, not limitations

### 10.2 Testing as Architectural Communication

- `Structural Symmetry`: Test organization mirrors system architecture—test hierarchy communicates design intent more clearly than documentation; conceptual integrity creates multiplicative quality improvements
- `Constraint Discovery Testing`: Tests should reveal system constraints, not just validate expected behavior; constraint discovery drives architectural evolution and emergent property identification
- `Interface Boundary Testing`: Validate abstraction layer integrity through rigorous conceptual stress testing; boundary failures reveal architectural weaknesses before implementation

### 10.3 Documentation Evolution Patterns

- `Specification Maturity`: Documentation lifecycle progresses from exploration to consolidation—when analysis matures into verified truth, consolidate into canonical source
- `Legitimacy Phase`: Transform aspirational claims into mathematically grounded analysis; academic rigor with conditional guarantees throughout entire specification
- `Documentation Primacy`: Mathematics and governance dependencies are fundamental; implementation details are secondary; conceptual integrity precedes implementation fidelity

### 10.4 System Evolution Dynamics

- `Emergent Elegance`: Solutions require multiple iterations—initial working code reveals constraints guiding toward elegant patterns; complexity reduction emerges from constraint understanding, not premature simplification
- `Progressive Enhancement`: When foundation exceeds 95% quality, surgical additions beat architectural rewrites; recognize excellence threshold where incremental improvement surpasses revolutionary change
- `Knowledge Lifecycle Management`: Context accumulates knowledge requiring periodic garbage collection—consolidate overlapping concepts by cognitive function; garbage collection is proactive evolution, not technical debt

### 10.5 Meta-Protocol Boundary Integrity

- `Universal Applicability`: Meta-principles must not reference project-specific concepts; maintain pure abstraction layer for protocol evolution
- `Contamination Detection`: Domain-specific content belongs in Architectural Decisions; boundary violations signal conceptual leakage
- `Iterative Refinement`: User feedback reveals boundary violations; continuous validation ensures abstraction layer integrity

---

## 1. Overall Concept

A token launch mechanism specification that combines minting curves with automatic treasury-owned liquidity generation through optimized Zap mechanics to create self-sustaining token economies with mathematically guaranteed price boundaries. The system exhibits emergent properties that enhance security and stability beyond designed mechanisms.

## 2. Core Entities

### 2.1 Primary Protocol:

- `TMCTOL`: Token Minting Curve + Treasury-Owned Liquidity with mathematically guaranteed price boundaries (See: `tmctol.en.md`)
- `L2 TOL`: Second-layer DAOs with declining voting power and constant L1 TOL protection (See: `l2-tol.en.md`)

### 2.2 Mechanisms:

- `TMC`: Linear bonding curve (P = P₀ + slope·s) for predictable emission
- `Axial Router`: Price discovery gateway routing TMC vs XYK optimally (See: `axial-router.en.md`)
- `TOL Multi-Bucket`: 66.6% minted supply → 4 independent buckets (~97.5% capital efficiency)
- `Fee Burning`: Router 0.5% → 100% burn for systematic deflation
- `Zap`: Intelligent liquidity addition handling price imbalances

### 2.3 Emergent Properties:

- `Price Ratchet`: TOL accumulation + fee burning → ever-rising floor
- `Bootstrap Gravity Well`: Critical TOL threshold (~15% market cap) → system stability transition
- `Supply Elasticity Inversion`: Post-threshold, inflation raises (not lowers) minimum price

---

## 3. Architectural Decisions

### 3.1 Core Mechanics (See: `tmctol.en.md` Section 2)

- `Unidirectional Minting`: One-way token creation prevents reserve extraction; creates mathematical lock-in for long-term alignment
- `Linear Pricing`: Fair, predictable progression (P = P₀ + slope·s); enables precise equilibrium calculations
- `Automatic TOL`: 66.6% mint allocation to protocol-owned liquidity; creates bootstrap gravity well and supply elasticity inversion

### 3.2 TOL Multi-Bucket Architecture (See: `tmctol.en.md` Section 2.4)

- `Multi-Bucket Strategy`: 4 independent buckets with varied governance thresholds; 97.5% capital efficiency vs 0% traditional treasuries; 75%+ failure resilience
- `Share-Based Withdrawal`: LP tokens managed as shares (not absolute amounts); mathematical correctness, no edge cases from pool state changes
- `Floor Protection Range`: Effective floor varies 11-25% based on bucket deployment decisions; governance explicitly trades floor strength for ecosystem development

### 3.3 Mathematical Foundations (See: `tmctol.en.md` Section 3)

- `Dimensional Type System`: Type system as physics engine—`Price [Foreign/Native²]` uses PRECISION (10¹²); dimensionless ratios use PPM (10⁶); prevents categorical errors at compile-time
- `Guaranteed Price Boundaries`: Calculable floor/ceiling formulas via permanent TOL accumulation; protection ranges 11-25% contingent on governance maintaining parameters
- `Bidirectional Compression`: Burning lowers ceiling, TOL raises floor → convergence creates mathematical security traps
- `XYK Constant Product Necessity`: Constant product (x·y=k) guarantees liquidity at all price levels; XYK "inefficiency" is precisely its strength for floor protection
- `Equilibrium Analysis`: System converges to P_eq ≈ √(R_TOL × m / PRECISION); equilibrium explicitly depends on governance-maintained parameters

### 3.4 L2 TOL Governance (See: `l2-tol.en.md`)

- `Declining Voting Power`: Direct holders 10x → 1x linear decay; prevents last-minute manipulation
- `Constant L1 TOL Protection`: L1 TOL maintains 10x (no decay); balanced ecosystem protection without extreme multipliers
- `Invoice Voting`: DOUBLE/APPROVE/REDUCE/VETO mechanics; VETO binary (>50% blocks), evaluations determine pricing multiplier
- `Progressive Rewards`: Active voters earn ~2x vs passive; economic incentive for participation

### 3.5 System Architecture (See: `axial-router.en.md`)

- `Router as Gateway`: Universal entry point ensures optimal price discovery, fee collection, consistent behavior
- `Zap-Based Liquidity`: Intelligent strategy handles price imbalances; maximizes depth when XYK lags TMC
- `XYK Pool Mandatory`: Constant product (x·y=k) guarantees liquidity at ALL price levels; XYK "inefficiency" prevents complete depletion
- `Fee Burning`: Router 0.5% → 100% burn for deflation; creates friction preventing infinite mint-swap avalanches

### 3.6 Testing & Validation (See: `simulator/tests.md`)

- `Simulator as Verification`: JavaScript/BigInt pre-production validation; multi-actor flows reveal emergent properties
- `RADB Structure`: Recursive Abstraction Decomposition—test organization mirrors system architecture
- `Attack Simulation`: Economic attack scenarios beyond mathematical correctness; router fees insufficient for complete MEV protection

---

## 4. Emergent Properties Layer

### 4.1 Critical System Transitions

- `Bootstrap Gravity Well`: Critical TOL accumulation threshold (~15% of market cap) where system transitions from fragile to stable
  - Mathematical Basis: Stability emerges when TOL value exceeds critical fraction of total market capitalization
  - Monitoring Requirement: System should track TOL/market-cap ratio and alert when approaching stability
- `Supply Elasticity Inversion Point`: Critical supply level where increasing supply begins raising (not lowering) minimum price
  - Counterintuitive Behavior: Traditional economics inverted—inflation becomes positive after critical point
  - Mathematical Proof: Floor growth rate exceeds ceiling growth rate due to TOL's quadratic effect

### 4.2 Security Enhancements

- `Vesting Cliff Math Trap`: Team tokens become mathematically difficult to exit
  - Security Feature: Additional protection beyond smart contract vesting
  - Monitoring: Track ceiling-floor gap and team token fraction of TOL reserves
- `Treasury Deadlock Security`: Governance paralysis increases effective lock ratio
  - Security Property: System becomes more secure during governance disputes
  - Mathematical Basis: Effective floor calculation includes governance state
- `Governance Attack Resilience`: Mathematical constraints protect against distribution manipulation
  - Security Feature: Extreme governance changes cannot compromise floor guarantee
  - Mathematical Basis: XYK invariant creates mathematical traps for value extraction
  - Monitoring: Track distribution changes and floor guarantee preservation
- `Cross-Chain Economic Independence`: Each chain maintains autonomy despite bridge failures
  - Security Feature: Price divergence and TOL concentration don't compromise floor guarantees
  - Mathematical Basis: XYK invariant operates independently per chain
  - Monitoring: Track TOL distribution and individual chain floor calculations

### 4.3 Economic Behaviors

- `Mint-Swap Feedback Loop`: Self-reinforcing cycle where TMC mints degrade XYK prices, making TMC more attractive
  - Mitigation: Router fees (0.5%) create sufficient friction to prevent infinite avalanches
  - Monitoring: Track consecutive TMC routes and price divergence
- `Slope Efficiency Sublinearity`: Equilibrium price scales as √slope, not linearly
  - Optimization Implication: Diminishing returns on slope parameter increases
  - Mathematical Proof: Equilibrium ≈ √(TOL_reserves × slope / PRECISION)
- `Price Ratchet Acceleration`: Deflation compounds floor growth through bidirectional compression
  - Mathematical Basis: Burning reduces ceiling while TOL increases floor, creating convergence
  - Long-term Effect: System becomes progressively more stable over time

---

## 5. Project Structure

- `/docs/`: Documentation directory with specifications and analysis
  - `tmctol.en.md` / `.ru.md`: Main TMCTOL specification — comprehensive framework covering architecture, mathematics, economics, and implementation (consolidated v2.0)
  - `l2-tol.en.md` / `.ru.md`: Layer-2 TOL integration specification
  - `axial-router.en.md` / `.ru.md`: Comprehensive Axial Router specification
- `/simulator/`: JavaScript-based formal verification environment for tokenomics
  - `model.js`: Simplified protocol model for mathematical verification
  - `tests.js`: Comprehensive test suite (45 tests including multi-actor correctness, emergent properties, and attack resistance)
  - `tests.md`: Test mirror with Nature/Necessity/Validates structure
- `README.md`: Project overview and quick start guide
- `LICENSE`: MIT license file

---

## 6. Development Conventions

### 6.1 Documentation Standards

- `Documentation`: All changes must be reflected in the specification document with clear rationale
- `Code Examples`: Use Rust for implementation examples to maintain consistency; recognize that code in documentation illustrates concepts, while simulator defines implementation truth
- `Language`: All documentation and code comments must be in English
- `Mathematical Precision`: All mathematical formulas must be rigorously validated with derivations and edge case analysis
- `Cross-Agent Validation`: External formula reviews reveal subtle scaling issues that may not surface in normal testing
- `Implementation Fidelity`: Code implementations must preserve mathematical correctness even when optimizing for integer arithmetic
- `Documentation Clarity`: Avoid duplication across sections; each concept should appear once in its most logical context
- `KISS Principle`: Balance simplicity with accuracy—oversimplification that distorts core mechanics is worse than appropriate complexity
- `Sequential Abstraction`: Documentation should guide readers logically from problem to solution without assuming prior knowledge
- `Precision Over Brevity`: Never sacrifice correctness for simplicity (e.g., "every purchase creates liquidity" when only TMC routes do)
- `Specification Primacy`: Core specification contains mathematical foundations; satellite documents provide focused deep-dives on specific subsystems; when analysis matures, consolidate into canonical specification

### 6.2 Progressive Evolution: Legitimacy Phase

Documentation undergoes continuous refinement toward academic-level legitimacy and objectivity:

- `Eliminate Marketing Language`: Replace "revolutionary," "breakthrough," "innovation" with precise technical descriptions
- `Conditional Guarantees`: All claims marked with explicit governance/parameter dependencies; no absolute guarantees
- `Mathematical Rigor`: Formulas presented with dimensional analysis, boundary conditions, proof sketches; avoid decorative notation
- `Governance Transparency`: Every security property explicitly labeled as "governance-dependent" or "conditional on X"
- `Framework vs Promises`: Document as "framework establishing bounds" not "system guaranteeing outcomes"
- `Compliance Requirement`: Floor/ceiling protection described as "11-25% range, contingent on governance maintaining conditions"
- `Mechanism over Rhetoric`: Explain HOW protection works, not promises of protection
- `Null Hypothesis Orientation`: Lead with what CAN go wrong (governance failure, parameter misalignment); protection is absence of failure, not presence of guarantee
- `Temporal Honesty`: Acknowledge system state-dependence; floor exists only when conditions met, not eternally
- `Audit Trail`: Every major claim traceable to mathematical proof or simulator test case

### 6.3 Technical Implementation

- `Iteration Toward Elegance`: First make it work, then make it elegant—functional patterns often emerge from imperative constraints
- `Simulation vs Production`: Fallback behaviors aid testing but reveal interface inconsistencies that demand normalization
- `Closure as Architecture`: JavaScript closures solve dependency injection more elegantly than class-based patterns

### 6.4 Dimensional Analysis Discipline

- `Physical Types Encode Units`: Variables must unambiguously convey both magnitude AND physical dimension—`Price [Foreign/Native]`, `Slope [Foreign/Native²]`, not generic `Value`
- `Scaling Factor Semantics`: Choice between PPM (10^6) vs PRECISION (10^12) is not implementation detail—it encodes whether quantity is dimensionless ratio (fees, shares) or physical quantity (price, slope)
- `Terminology Precision`: Avoid generic terms (`Token`, `amount`) when specific domains exist (`Native` for minted token, `Foreign` for payment currency)
- `Formula Dimensional Consistency`: Every arithmetic operation must preserve dimensional correctness—adding `[Foreign/Native]` to `[dimensionless]` is type error even if magnitudes compatible
- `Quadratic Derivations`: When integrating price curves, verify dimensions at each algebraic step—coefficient `b` and `c` scaling must match equation's physical meaning

### 6.5 Naming Consistency Patterns

- `Type-First Discipline`: Always lead with domain type (`native_`, `foreign_`, `amount_`); never use bare `fee` or `net`—always specify currency domain
- `Context-Aware Scoping`: Local context allows simpler names (`native_fee`), return values need full context (`native_router_fee`)
- `Dimensional Prefix Convention`: When variable represents physical quantity, name should reflect dimension—`slope` implies [Price/Token], explicit `slope_per_token_squared` too verbose, type annotation `Slope [Foreign/Native²]` balances clarity

### 6.6 Testing Wisdom Patterns

- `Deep Reading Imperative`: Comprehensive testing lurks behind simple interfaces; file outlines deceive—always read originals before refactoring; surface appearances conceal architectural depth
- `Enhancement Strategy`: When foundation exceeds 95% quality, surgical additions beat architectural rewrites; recognize excellence threshold where incremental improvement surpasses revolutionary change
- `Production Readiness Criteria`: Systems must pass both mathematical verification AND economic attack simulation; mathematical correctness ≠ economic security—real-world attack vectors require scenario validation
- `Structural Symmetry`: Test organization should mirror system architecture—optimal structure emerges from understanding behavioral patterns; test hierarchy communicates system design more clearly than documentation
- `Documentation Lifecycle`: Code and documentation must evolve in parallel—static documentation becomes architectural liability; triple-sync (code + tests + docs) prevents drift through cross-validation
- `Test Failure Hermeneutics`: Test failures signal bugs OR architectural evolution—distinguish implementation error from specification change; assertion updates may reflect new understanding, not test weakness

### 6.7 Meta-Protocol Boundary Testing

- `Universal Applicability Check`: Meta-principles must not reference project-specific concepts
- `Contamination Detection`: Domain-specific content belongs in Architectural Decisions
- `Iterative Refinement`: User feedback reveals boundary violations

---

## 7. Pre-Task Preparation Protocol

Step 1: Load `/docs/README.md` for documentation architecture
Step 2: Integrate entity-specific documentation for task context
Step 3: Verify alignment with architectural decisions and conventions
Step 4: Document knowledge gaps for future enhancement
Step 5: Review emergent properties implications for current task

---

## 8. Task Completion Protocol

Step 1: Verify architectural consistency (sections 3-5)
Step 2: Execute quality validation: `deno ./simulator/tests.js` (45 tests, hierarchical X.Y codes)
Step 3: Update `/docs/README.md` guides for affected entities
Step 4: Mandatory Context Evolution:

- Analyze architectural impact
- Update sections 1-5 for currency
- Add substantive Change History entry

Step 5: Garbage Collection Evaluation Workflow

## 9. Change History

### 1. Methodology Evolution: From Specification to Production

- `Core Insights`: Emergent elegance through iteration; dimensional type systems prevent runtime errors; progressive enhancement over rewrites; knowledge lifecycle management as proactive evolution

- `Key Patterns`: Test-discovery-specification cycle; morphological-first architecture (analyze 6+ options before choosing); surgical refactoring via pattern recognition

### 2. Testing Philosophy: Structural Symmetry

- `Principle`: Test organization mirrors system architecture—conceptual integrity creates multiplicative quality improvements

- `RADB Pattern (Recursive Abstraction Decomposition)`: Boundaries → Precision → Integration → Multi-actor → Emergent Properties → Attack Resistance

- `Validation`: 42 optimally organized tests > 43 arbitrarily categorized; test order IS architecture communication

### 3. TOL Architecture: Separation of Concerns

- `Breakthrough`: Distribution is governance concern, not protocol concern

### 4. Security Model: Economic Attack Simulation

- `Shift`: Mathematical correctness ≠ economic security; real attack vectors require scenario validation

- `Properties Validated`: Governance resilience, cross-chain independence, fee friction (0.5%) prevents avalanches, sandwich attack resistance

- `Emergent Properties`: Bootstrap gravity well (~15% TOL/market cap stability threshold); supply elasticity inversion (post-threshold inflation raises floor); price ratchet (ever-rising floor)

### 5. L2 TOL Governance: Constant Protection Model

- `Evolution`: L1 TOL receives `constant 10x multiplier` (no decay) vs direct holders declining 10x → 1x

- `Rationale`: Balanced ecosystem protection without extreme multipliers (previous 100x → 10x seemed excessive)

- `Invoice Voting`: DOUBLE/APPROVE/REDUCE/VETO mechanics; VETO binary (>50% blocks), evaluations determine multiplier; early voters (10x) influence pricing more than late (1x); L1 TOL maintains constant 10x

- `Security`: Mitigates late-stage attacks, invoice fraud via VETO threshold, time-based defense gradient

- `References`: `l2-tol.en.md` Sections 2.3, 3.1-3.4, 6.2, 7-9; `l2-tol.ru.md` for Russian translations

### 6. Documentation Legitimacy Evolution

- `Objective`: Transform documentation from aspirational claims to academic-level technical analysis
- `Key Changes`:
  - Removed marketing language ("revolutionary," "breakthrough," "innovation")
  - Made all guarantees explicitly conditional on governance maintaining system parameters
  - Reframed floor/ceiling as "mathematically derived boundaries" not "guaranteed protection"
  - Added explicit governance risk section detailing conditions for floor preservation
  - Improved mathematical notation with dimensional analysis and boundary conditions
  - Changed floor specification from "11%" to "11-25% range, governance-dependent"
  - Documented that equilibrium emerges from state-dependent dynamics, not predetermined progression
  - Labeled all system properties with "contingent on X" qualifiers
- `Result`: Documentation now suitable for academic/regulatory review; claims anchored in mathematics, not promises

### 7. Specification Maturity: Consolidation Phase (Current)

- `Evolution`: Hybrid specification (`tmctol-hybrid.en.md`) became canonical specification (`tmctol.en.md`)
- `Architectural Insight`: Mathematical foundations belong in core specification, not satellite documents
  - Previous: `tmctol.en.md` (implementation-focused) + `price-boundaries.en.md` (mathematical analysis) as separate documents
  - Current: Unified `tmctol.en.md` integrating Foundation → Architecture → Mathematics → Economics → Dynamics → Implementation → Trade-offs
- `Key Principles Applied`:
  - `Specification Maturity`: When exploratory analysis matures into verified truth, consolidate into canonical source; documentation lifecycle progresses from exploration to consolidation
  - `Legitimacy Phase`: Academic rigor with conditional guarantees throughout entire specification; transform aspirational claims into mathematically grounded analysis
  - `Documentation Primacy`: Mathematics and governance dependencies are fundamental; implementation details are secondary; conceptual integrity precedes implementation fidelity
  - `Layered Abstraction`: Clear separation between "what system guarantees" (Section 3: Math) vs "how system implements" (Section 6: Implementation); abstraction layers create cognitive scaffolding for progressive comprehension
- `Structural Benefits`:
  - Single source of truth for TMCTOL framework eliminates cross-document synchronization burden
  - Progressive reading flow: conceptual foundation → technical architecture → mathematical proof → economic model → implementation requirements
  - Governance dependencies explicit in every major section (not hidden in auxiliary documents)
  - Bilingual maintenance simplified (en/ru versions directly parallel)
- `Eliminated Redundancy`: `price-boundaries.en.md` content fully integrated into Section 3 "Mathematical Foundations" with enhanced context
- `Simulator as Truth`: Recognized that Rust code examples in documentation are illustrative; JavaScript simulator (`/simulator/`) defines implementation ground truth
- `Layered Abstraction Insights`: Developed comprehensive understanding of cognitive scaffolding, constraint-driven evolution, and progressive comprehension patterns (See Section 10)

### 8. Layered Abstraction Evolution (Current)

- `Core Insights`: Cognitive scaffolding enables progressive comprehension of complex systems; abstraction layers create firewalls preventing conceptual contamination; constraint discovery drives architectural evolution
- `Key Patterns`:
  - Progressive comprehension through cognitive scaffolding
  - Abstraction firewalls maintaining domain purity
  - Constraint discovery as evolutionary catalyst
  - Testing as architectural communication
  - Documentation evolution from exploration to consolidation
- `Cognitive Architecture`: Complex systems require staged understanding—each layer builds upon previous without overwhelming; cognitive scaffolding enables deeper insight through structured learning pathways
- `Testing Philosophy`: Tests should reveal system constraints, not just validate expected behavior; constraint discovery drives architectural evolution and emergent property identification
- `Documentation Maturity`: Documentation lifecycle progresses from exploration to consolidation—when analysis matures into verified truth, consolidate into canonical source
- `System Evolution`: Emergent elegance through constraint understanding—complexity reduction emerges from constraint discovery, not premature simplification
- `Meta-Protocol Integrity`: Universal applicability maintained through rigorous boundary testing—validate abstraction layer integrity under conceptual stress
