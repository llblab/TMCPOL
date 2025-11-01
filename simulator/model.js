// @ts-check

/**
 * @name `TMCTOL` Simulator
 * @note This simulator serves for preliminary economic testing, parameter optimization, and business logic formalization of composite tokenomics models.
 * @units Balances, prices and slope use `PRECISION` (10^12) for accuracy. Fractional values (fees, shares) use `PPM` (Parts Per Million, 10^6) and require a '_ppm' suffix.
 * @version 1.0.0
 * @module model.js
 */

/** @typedef {{ user_ppm: bigint, tol_ppm: bigint }} ShareConfig */
/** @typedef {{ bucket_a_ppm: bigint, bucket_b_ppm: bigint, bucket_c_ppm: bigint, bucket_d_ppm: bigint }} TolBucketConfig */
/** @typedef {{ price_initial: bigint, slope: bigint, fee_xyk_ppm: bigint, fee_router_ppm: bigint, min_swap_foreign: bigint, min_initial_foreign: bigint, shares: ShareConfig, tol_buckets: TolBucketConfig }} SystemConfig */
/** @typedef {{ fee_ppm: bigint }} XykPoolConfig */
/** @typedef {{ price_initial: bigint, slope: bigint, shares: ShareConfig }} TmcMinterConfig */
/** @typedef {{ min_swap_foreign: bigint }} FeeManagerConfig */
/** @typedef {{ fee_router_ppm: bigint, min_swap_foreign: bigint, min_initial_foreign: bigint }} SmartRouterConfig */

export const DECIMALS = 12n;
export const PRECISION = 10n ** DECIMALS;
export const PPM = 1_000_000n;

export const DEFAULT_CONFIG = /** @type {SystemConfig} */ {
  min_initial_foreign: 100n * PRECISION,
  min_swap_foreign: PRECISION / 100n,
  price_initial: PRECISION / 1_000n,
  slope: PRECISION / 1_000n,
  fee_xyk_ppm: 0n,
  fee_router_ppm: (5n * PPM) / 1_000n,
  shares: {
    user_ppm: 333_333n,
    tol_ppm: 666_667n,
  },
  tol_buckets: {
    bucket_a_ppm: 500_000n,
    bucket_b_ppm: 166_667n,
    bucket_c_ppm: 166_667n,
    bucket_d_ppm: 166_666n,
  },
};

export class BigMath {
  static mul_div(
    /** @type {bigint} */ a,
    /** @type {bigint} */ b,
    /** @type {bigint} */ c,
  ) {
    if (c === 0n) {
      throw new Error("Division by zero");
    }
    return (a * b) / c;
  }

  static div_ceil(/** @type {bigint} */ a, /** @type {bigint} */ b) {
    if (b === 0n) {
      throw new Error("Division by zero");
    }
    return a % b === 0n ? a / b : a / b + 1n;
  }

  static isqrt(/** @type {bigint} */ n) {
    if (n < 0n) {
      throw new Error("Square root of negative number");
    }
    if (n < 2n) {
      return n;
    }
    let x = n;
    let y = (x + 1n) / 2n;
    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }
    return x;
  }

  static min(/** @type {bigint} */ a, /** @type {bigint} */ b) {
    return a < b ? a : b;
  }

  static max(/** @type {bigint} */ a, /** @type {bigint} */ b) {
    return a > b ? a : b;
  }

  static abs(/** @type {bigint} */ a) {
    return a < 0n ? -a : a;
  }
}

export class User {
  constructor(
    /** @type {bigint} */ initial_native = 0n,
    /** @type {bigint} */ initial_foreign = 0n,
  ) {
    this.balance_native = initial_native;
    this.balance_foreign = initial_foreign;
    this.router = null;
  }

  set_router(/** @type {SmartRouter} */ router) {
    this.router = router;
  }

  get_balance() {
    return {
      native: this.balance_native,
      foreign: this.balance_foreign,
    };
  }

  buy_native(/** @type {bigint} */ foreign_amount) {
    if (!this.router) {
      throw new Error("Router not initialized");
    }
    if (foreign_amount > this.balance_foreign) {
      throw new Error(
        `Insufficient foreign balance: ${this.balance_foreign} < ${foreign_amount}`,
      );
    }
    this.balance_foreign -= foreign_amount;
    const result = this.router.swap_foreign_to_native(foreign_amount);
    this.balance_native += result.native_out;
    return result;
  }

  sell_native(/** @type {bigint} */ native_amount) {
    if (!this.router) {
      throw new Error("Router not initialized");
    }
    if (native_amount > this.balance_native) {
      throw new Error(
        `Insufficient native balance: ${this.balance_native} < ${native_amount}`,
      );
    }
    this.balance_native -= native_amount;
    const result = this.router.swap_native_to_foreign(native_amount);
    this.balance_foreign += result.foreign_out;
    return result;
  }

  deposit_foreign(/** @type {bigint} */ amount) {
    if (amount <= 0n) {
      throw new Error("Deposit amount must be positive");
    }
    this.balance_foreign += amount;
    return this.balance_foreign;
  }

  deposit_native(/** @type {bigint} */ amount) {
    if (amount <= 0n) {
      throw new Error("Deposit amount must be positive");
    }
    this.balance_native += amount;
    return this.balance_native;
  }
}

/** Treasury actor for multi-actor simulations
 * Holds native tokens allocated during minting (now managed via TOL buckets)
 */
export class Treasury {
  constructor(/** @type {bigint} */ initial_native = 0n) {
    this.balance_native = initial_native;
    this.router = null;
  }

  set_router(/** @type {SmartRouter} */ router) {
    this.router = router;
  }

  get_balance() {
    return this.balance_native;
  }

  receive_mint_allocation(/** @type {bigint} */ amount) {
    if (amount < 0n) {
      throw new Error("Allocation amount cannot be negative");
    }
    this.balance_native += amount;
    return this.balance_native;
  }

  sell_native(/** @type {bigint} */ native_amount) {
    if (!this.router) {
      throw new Error("Router not initialized");
    }
    if (native_amount > this.balance_native) {
      throw new Error(
        `Insufficient treasury balance: ${this.balance_native} < ${native_amount}`,
      );
    }
    this.balance_native -= native_amount;
    const result = this.router.swap_native_to_foreign(native_amount);
    return result;
  }
}

export class LiquidityBucket {
  constructor(
    /** @type {string} */ bucket_id,
    /** @type {XykPool} */ xyk_pool,
  ) {
    this.bucket_id = bucket_id;
    this.xyk_pool = xyk_pool;
    this.buffer_native = 0n;
    this.buffer_foreign = 0n;
    this.balance_lp = 0n;
    this.contributed_native = 0n;
    this.contributed_foreign = 0n;
  }

  get_balance() {
    return {
      buffer_native: this.buffer_native,
      buffer_foreign: this.buffer_foreign,
      balance_lp: this.balance_lp,
      contributed_native: this.contributed_native,
      contributed_foreign: this.contributed_foreign,
    };
  }

  add_liquidity_with_zap(
    /** @type {bigint} */ native,
    /** @type {bigint} */ foreign,
  ) {
    if (native < 0n || foreign < 0n) {
      throw new Error("Amounts cannot be negative");
    }
    if (native === 0n && foreign === 0n) {
      return this.#create_liquidity_result(0n, 0n, 0n);
    }

    if (!this.xyk_pool.has_liquidity()) {
      return this.#try_initialize_pool(native, foreign);
    }

    return this.#execute_zap_and_update(native, foreign);
  }

  #create_liquidity_result(
    /** @type {bigint} */ lp_minted,
    /** @type {bigint} */ native_used,
    /** @type {bigint} */ foreign_used,
  ) {
    return {
      bucket_id: this.bucket_id,
      lp_minted,
      native_used,
      foreign_used,
      buffer_native: this.buffer_native,
      buffer_foreign: this.buffer_foreign,
    };
  }

  #try_initialize_pool(
    /** @type {bigint} */ native,
    /** @type {bigint} */ foreign,
  ) {
    const total_native = this.buffer_native + native;
    const total_foreign = this.buffer_foreign + foreign;
    if (total_native === 0n || total_foreign === 0n) {
      this.buffer_native = total_native;
      this.buffer_foreign = total_foreign;
      return this.#create_liquidity_result(0n, 0n, 0n);
    }

    try {
      const result = this.xyk_pool.add_liquidity(total_native, total_foreign);
      this.balance_lp += result.lp_minted;
      this.contributed_native += result.native_used;
      this.contributed_foreign += result.foreign_used;
      this.buffer_native = result.native_rest;
      this.buffer_foreign = result.foreign_rest;
      return this.#create_liquidity_result(
        result.lp_minted,
        result.native_used,
        result.foreign_used,
      );
    } catch (e) {
      this.buffer_native = total_native;
      this.buffer_foreign = total_foreign;
      return this.#create_liquidity_result(0n, 0n, 0n);
    }
  }

  #execute_zap_and_update(
    /** @type {bigint} */ native,
    /** @type {bigint} */ foreign,
  ) {
    const total_native = this.buffer_native + native;
    const total_foreign = this.buffer_foreign + foreign;
    let native_rest = total_native;
    let foreign_rest = total_foreign;
    let lp_minted = 0n;
    let native_used = 0n;
    let foreign_used = 0n;
    if (native_rest > 0n && foreign_rest > 0n) {
      const foreign_by_native = BigMath.mul_div(
        native_rest,
        this.xyk_pool.reserve_foreign,
        this.xyk_pool.reserve_native,
      );
      const [native_to_add, foreign_to_add] =
        foreign_by_native <= foreign_rest
          ? [native_rest, foreign_by_native]
          : [
              BigMath.mul_div(
                foreign_rest,
                this.xyk_pool.reserve_native,
                this.xyk_pool.reserve_foreign,
              ),
              foreign_rest,
            ];
      if (native_to_add > 0n && foreign_to_add > 0n) {
        try {
          const add_result = this.xyk_pool.add_liquidity(
            native_to_add,
            foreign_to_add,
          );
          lp_minted = add_result.lp_minted;
          native_used = add_result.native_used;
          foreign_used = add_result.foreign_used;
          native_rest -= add_result.native_used;
          foreign_rest -= add_result.foreign_used;
        } catch (e) {
          console.warn(
            `Bucket ${this.bucket_id} add_liquidity failed:`,
            String(e),
          );
        }
      }
    }

    if (foreign_rest > 0n && this.xyk_pool.has_liquidity()) {
      try {
        const swap_result = this.xyk_pool.swap_foreign_to_native(foreign_rest);
        native_rest += swap_result.native_out;
        foreign_used += foreign_rest;
        foreign_rest = 0n;
      } catch (e) {
        console.warn(`Bucket ${this.bucket_id} zap swap failed:`, String(e));
      }
    }

    this.balance_lp += lp_minted;
    this.contributed_native += native_used;
    this.contributed_foreign += foreign_used;
    this.buffer_native = native_rest;
    this.buffer_foreign = foreign_rest;
    return this.#create_liquidity_result(lp_minted, native_used, foreign_used);
  }
}

export class TolManager {
  constructor(
    /** @type {XykPool} */ xyk_pool,
    /** @type {TolBucketConfig} */ bucket_config,
  ) {
    this.xyk_pool = xyk_pool;
    this.bucket_config = bucket_config;
    const sum_buckets =
      bucket_config.bucket_a_ppm +
      bucket_config.bucket_b_ppm +
      bucket_config.bucket_c_ppm +
      bucket_config.bucket_d_ppm;
    if (sum_buckets !== PPM) {
      throw new Error(`Bucket shares must sum to ${PPM}, got ${sum_buckets}`);
    }
    this.bucket_a = new LiquidityBucket("A", xyk_pool);
    this.bucket_b = new LiquidityBucket("B", xyk_pool);
    this.bucket_c = new LiquidityBucket("C", xyk_pool);
    this.bucket_d = new LiquidityBucket("D", xyk_pool);
  }

  get_balance() {
    return {
      bucket_a: this.bucket_a.get_balance(),
      bucket_b: this.bucket_b.get_balance(),
      bucket_c: this.bucket_c.get_balance(),
      bucket_d: this.bucket_d.get_balance(),
    };
  }

  receive_mint_allocation(
    /** @type {bigint} */ total_native,
    /** @type {bigint} */ total_foreign,
  ) {
    const b1_native = BigMath.mul_div(
      total_native,
      this.bucket_config.bucket_a_ppm,
      PPM,
    );
    const b2_native = BigMath.mul_div(
      total_native,
      this.bucket_config.bucket_b_ppm,
      PPM,
    );
    const b3_native = BigMath.mul_div(
      total_native,
      this.bucket_config.bucket_c_ppm,
      PPM,
    );
    const b4_native = total_native - b1_native - b2_native - b3_native;
    const b1_foreign = BigMath.mul_div(
      total_foreign,
      this.bucket_config.bucket_a_ppm,
      PPM,
    );
    const b2_foreign = BigMath.mul_div(
      total_foreign,
      this.bucket_config.bucket_b_ppm,
      PPM,
    );
    const b3_foreign = BigMath.mul_div(
      total_foreign,
      this.bucket_config.bucket_c_ppm,
      PPM,
    );
    const b4_foreign = total_foreign - b1_foreign - b2_foreign - b3_foreign;
    const result_a = this.bucket_a.add_liquidity_with_zap(
      b1_native,
      b1_foreign,
    );
    const result_b = this.bucket_b.add_liquidity_with_zap(
      b2_native,
      b2_foreign,
    );
    const result_c = this.bucket_c.add_liquidity_with_zap(
      b3_native,
      b3_foreign,
    );
    const result_d = this.bucket_d.add_liquidity_with_zap(
      b4_native,
      b4_foreign,
    );
    return {
      bucket_a: result_a,
      bucket_b: result_b,
      bucket_c: result_c,
      bucket_d: result_d,
    };
  }
}

export class XykPool {
  constructor(/** @type {XykPoolConfig} */ config) {
    if (config.fee_ppm >= PPM) {
      throw new Error("Fee must be < 100%");
    }
    this.fee_ppm = config.fee_ppm;
    this.reserve_native = 0n;
    this.reserve_foreign = 0n;
    this.supply_lp = 0n;
  }

  get_price() {
    if (this.reserve_native === 0n) {
      throw new Error("Cannot calculate price with zero native reserves");
    }
    if (this.reserve_foreign === 0n) {
      throw new Error("Cannot calculate price with zero foreign reserves");
    }
    return BigMath.mul_div(
      this.reserve_foreign,
      PRECISION,
      this.reserve_native,
    );
  }

  has_liquidity() {
    return this.reserve_native > 0n && this.reserve_foreign > 0n;
  }

  get_out_native(/** @type {bigint} */ foreign) {
    if (foreign <= 0n || !this.has_liquidity()) {
      return 0n;
    }
    return this.#calculate_swap_output(
      foreign,
      this.reserve_foreign,
      this.reserve_native,
    );
  }

  get_out_foreign(/** @type {bigint} */ native) {
    if (native <= 0n || !this.has_liquidity()) {
      return 0n;
    }
    return this.#calculate_swap_output(
      native,
      this.reserve_native,
      this.reserve_foreign,
    );
  }

  add_liquidity(/** @type {bigint} */ native, /** @type {bigint} */ foreign) {
    if (native <= 0n || foreign <= 0n) {
      throw new Error("Amounts must be positive");
    }
    if (!this.has_liquidity()) {
      const lp_minted = BigMath.isqrt(native * foreign);
      if (lp_minted === 0n) {
        throw new Error("Insufficient initial liquidity");
      }
      this.reserve_native = native;
      this.reserve_foreign = foreign;
      this.supply_lp = lp_minted;
      return {
        lp_minted,
        native_used: native,
        foreign_used: foreign,
        native_rest: 0n,
        foreign_rest: 0n,
      };
    }
    const lp_from_native = BigMath.mul_div(
      native,
      this.supply_lp,
      this.reserve_native,
    );
    const lp_from_foreign = BigMath.mul_div(
      foreign,
      this.supply_lp,
      this.reserve_foreign,
    );
    const lp_minted = BigMath.min(lp_from_native, lp_from_foreign);
    if (lp_minted === 0n) {
      throw new Error("Insufficient liquidity provided");
    }
    const native_used = BigMath.mul_div(
      this.reserve_native,
      lp_minted,
      this.supply_lp,
    );
    const foreign_used = BigMath.mul_div(
      this.reserve_foreign,
      lp_minted,
      this.supply_lp,
    );
    this.reserve_native += native_used;
    this.reserve_foreign += foreign_used;
    this.supply_lp += lp_minted;
    return {
      lp_minted,
      native_used,
      foreign_used,
      native_rest: native - native_used,
      foreign_rest: foreign - foreign_used,
    };
  }

  swap_native_to_foreign(
    /** @type {bigint} */ native_in,
    /** @type {bigint} */ min_foreign_out = 0n,
  ) {
    if (native_in <= 0n) {
      throw new Error("Amount must be positive");
    }
    if (!this.has_liquidity()) {
      throw new Error("No liquidity");
    }
    const foreign_out = this.get_out_foreign(native_in);
    if (foreign_out < min_foreign_out) {
      throw new Error("Slippage exceeded");
    }
    const ideal_output = BigMath.mul_div(
      native_in * this.reserve_foreign,
      1n,
      this.reserve_native + native_in,
    );
    const foreign_xyk_fee = ideal_output - foreign_out;
    return this.#execute_swap(native_in, foreign_out, true);
  }

  swap_foreign_to_native(
    /** @type {bigint} */ foreign_in,
    /** @type {bigint} */ min_native_out = 0n,
  ) {
    if (foreign_in <= 0n) {
      throw new Error("Amount must be positive");
    }
    if (!this.has_liquidity()) {
      throw new Error("No liquidity");
    }
    const native_out = this.get_out_native(foreign_in);
    if (native_out < min_native_out) {
      throw new Error("Slippage exceeded");
    }
    const ideal_output = BigMath.mul_div(
      foreign_in * this.reserve_native,
      1n,
      this.reserve_foreign + foreign_in,
    );
    const native_xyk_fee = ideal_output - native_out;
    return this.#execute_swap(foreign_in, native_out, false);
  }

  #execute_swap(
    /** @type {bigint} */ amount_in,
    /** @type {bigint} */ amount_out,
    /** @type {boolean} */ native_to_foreign,
  ) {
    const price_before = this.get_price();
    if (native_to_foreign) {
      if (this.reserve_foreign < amount_out) {
        throw new Error("Insufficient foreign reserves");
      }
      this.reserve_native += amount_in;
      this.reserve_foreign -= amount_out;
    } else {
      if (this.reserve_native < amount_out) {
        throw new Error("Insufficient native reserves");
      }
      this.reserve_foreign += amount_in;
      this.reserve_native -= amount_out;
    }
    const price_after = this.get_price();
    // Price impact calculation: for native_to_foreign, price increases; for foreign_to_native, price decreases
    const price_change = native_to_foreign
      ? price_after - price_before
      : price_before - price_after;
    const price_impact_ppm =
      price_before > 0n
        ? BigMath.mul_div(BigMath.abs(price_change), PPM, price_before)
        : 0n;
    return {
      native_in: native_to_foreign ? amount_in : 0n,
      native_out: native_to_foreign ? 0n : amount_out,
      foreign_in: native_to_foreign ? 0n : amount_in,
      foreign_out: native_to_foreign ? amount_out : 0n,
      price_before,
      price_after,
      price_impact_ppm,
    };
  }

  #calculate_swap_output(
    /** @type {bigint} */ amount_in,
    /** @type {bigint} */ reserve_in,
    /** @type {bigint} */ reserve_out,
  ) {
    if (amount_in <= 0n || reserve_in <= 0n || reserve_out <= 0n) {
      return 0n;
    }
    const amount_in_with_fee = amount_in * (PPM - this.fee_ppm);
    const numerator = amount_in_with_fee * reserve_out;
    const denominator = reserve_in * PPM + amount_in_with_fee;
    return numerator / denominator;
  }
}

/** `Token Minting Curve` Minter
 */
export class TmcMinter {
  constructor(
    /** @type {TmcMinterConfig} */ config,
    /** @type {TolManager} */ tol,
  ) {
    if (config.price_initial <= 0n) {
      throw new Error("Initial price must be positive");
    }
    if (config.slope < 0n) {
      throw new Error("Slope must be non-negative");
    }
    this.price_initial = config.price_initial;
    this.slope = config.slope;
    this.user_ppm = config.shares.user_ppm;
    this.tol_ppm = config.shares.tol_ppm;
    this.tol = tol;
    this.supply = 0n;
    const sum_shares = this.user_ppm + this.tol_ppm;
    if (sum_shares !== PPM) {
      throw new Error(`Shares must sum to ${PPM}, got ${sum_shares}`);
    }
  }

  get_price() {
    const slope_component = BigMath.mul_div(this.slope, this.supply, PRECISION);
    return this.price_initial + slope_component;
  }

  calculate_mint(/** @type {bigint} */ foreign) {
    if (foreign <= 0n) {
      return 0n;
    }
    const price_initial = this.price_initial;
    const slope = this.slope;
    const supply = this.supply;
    if (slope === 0n) {
      return BigMath.mul_div(foreign, PRECISION, price_initial);
    }
    const a = slope;
    const b = 2n * price_initial * PRECISION + 2n * slope * supply;
    const c = 2n * foreign * PRECISION * PRECISION;
    const discriminant = b * b + 4n * a * c;
    if (discriminant < 0n) {
      return 0n;
    }
    const sqrt_discriminant = BigMath.isqrt(discriminant);
    const numerator = sqrt_discriminant - b;
    if (numerator <= 0n) {
      return 0n;
    }
    const delta_supply = numerator / (2n * a);
    return delta_supply;
  }

  mint_native(/** @type {bigint} */ foreign_in) {
    const price_before = this.get_price();
    const total_native = this.calculate_mint(foreign_in);
    if (total_native === 0n) {
      throw new Error("Insufficient amount");
    }
    this.supply += total_native;
    const distribution = this.#distribute(total_native);
    const tol_result = this.tol.receive_mint_allocation(
      distribution.tol,
      foreign_in,
    );
    const price_after = this.get_price();
    return {
      total_minted: total_native,
      user_native: distribution.user,
      tol_native: distribution.tol,
      price_before,
      price_after,
      tol: tol_result,
    };
  }

  get_mint_quote(/** @type {bigint} */ foreign) {
    const native_minted = this.calculate_mint(foreign);
    if (native_minted === 0n) {
      return null;
    }
    return {
      minted: native_minted,
      ...this.#distribute(native_minted),
    };
  }

  burn_native(/** @type {bigint} */ amount) {
    if (amount <= 0n) {
      throw new Error("Burn amount must be positive");
    }
    if (this.supply < amount) {
      throw new Error(
        `Insufficient supply for burn: ${this.supply} < ${amount}`,
      );
    }
    const supply_before = this.supply;
    this.supply -= amount;
    return {
      native_burned: amount,
      supply_before,
      supply_after: this.supply,
    };
  }

  #distribute(/** @type {bigint} */ total_native) {
    const user = BigMath.mul_div(total_native, this.user_ppm, PPM);
    const tol = total_native - user;
    return { user, tol };
  }
}

export class FeeManager {
  constructor(
    /** @type {XykPool} */ xyk_pool,
    /** @type {TmcMinter} */ tmc_minter,
    /** @type {FeeManagerConfig} */ config,
  ) {
    this.xyk_pool = xyk_pool;
    this.tmc_minter = tmc_minter;
    this.min_swap_foreign = config.min_swap_foreign;
    this.buffer_native = 0n;
    this.buffer_foreign = 0n;
    this.total_native_burned = 0n;
    this.total_foreign_swapped = 0n;
    this.fees = { native: 0n, foreign: 0n };
  }

  receive_fee_native(/** @type {bigint} */ native) {
    if (native <= 0n) return;
    this.fees.native += native;
    this.buffer_native += native;
    const result = this.#execute_burn(this.buffer_native, 0n);
    this.buffer_native = result.native_buffered;
    this.total_native_burned += result.native_burned;
  }

  receive_fee_foreign(/** @type {bigint} */ foreign) {
    if (foreign <= 0n) return;
    this.fees.foreign += foreign;
    this.buffer_foreign += foreign;
    const result = this.#execute_burn(0n, this.buffer_foreign);
    this.buffer_foreign = result.foreign_buffered;
    this.total_native_burned += result.native_burned;
    this.total_foreign_swapped += result.foreign_swapped;
  }

  #execute_burn(
    /** @type {bigint} */ amount_native_fee,
    /** @type {bigint} */ amount_foreign_fee,
  ) {
    let result = {
      native_burned: 0n,
      foreign_swapped: 0n,
      foreign_buffered: amount_foreign_fee,
      native_buffered: amount_native_fee,
      native_to_burn: amount_native_fee,
      foreign_to_swap: 0n,
    };
    if (
      amount_foreign_fee >= this.min_swap_foreign &&
      this.xyk_pool.has_liquidity()
    ) {
      try {
        // Execute swap using XYK pool only
        const swap_result = this.xyk_pool.swap_foreign_to_native(
          amount_foreign_fee,
          0n,
        );
        result.foreign_to_swap = amount_foreign_fee;
        result.foreign_swapped = amount_foreign_fee;
        result.foreign_buffered = 0n;
        result.native_to_burn += swap_result.native_out;
      } catch (e) {
        // Swap failed, keep foreign in buffer
        console.warn("FeeManager swap failed, keeping in buffer:", String(e));
      }
    }
    if (result.native_to_burn > 0n) {
      try {
        this.tmc_minter.burn_native(result.native_to_burn);
        result.native_burned = result.native_to_burn;
        result.native_buffered = 0n;
      } catch (e) {
        // Burn failed, keep native in buffer
        console.warn("FeeManager burn failed, keeping in buffer:", String(e));
        result.native_buffered = result.native_to_burn;
      }
    }
    return result;
  }
}

export class SmartRouter {
  constructor(
    /** @type {XykPool} */ xyk_pool,
    /** @type {TmcMinter} */ tmc_minter,
    /** @type {FeeManager} */ fee_manager,
    /** @type {SmartRouterConfig} */ config,
  ) {
    this.xyk_pool = xyk_pool;
    this.tmc_minter = tmc_minter;
    this.fee_manager = fee_manager;
    this.fee_router_ppm = config.fee_router_ppm;
    this.min_swap_foreign = config.min_swap_foreign;
    this.min_initial_foreign = config.min_initial_foreign;
  }

  swap_foreign_to_native(
    /** @type {bigint} */ foreign_in,
    /** @type {bigint} */ min_native_out = 0n,
  ) {
    this.#validate_swap_input(
      foreign_in,
      this.min_swap_foreign,
      `Amount below minimum threshold (${this.min_swap_foreign} foreign)`,
    );
    // Check if this is the first mint and pool is not initialized
    if (
      !this.xyk_pool.has_liquidity() &&
      foreign_in < this.min_initial_foreign
    ) {
      throw new Error(
        `Initial mint requires minimum ${this.min_initial_foreign} foreign tokens`,
      );
    }
    const foreign_fee = BigMath.mul_div(foreign_in, this.fee_router_ppm, PPM);
    const foreign_net = foreign_in - foreign_fee;
    if (foreign_net <= 0n) {
      throw new Error("Amount too small");
    }
    // Inline #select_best_route logic
    const tmc_quote = this.tmc_minter.get_mint_quote(foreign_net);
    const tmc_out = tmc_quote?.user ?? 0n;
    const xyk_out = this.xyk_pool.has_liquidity()
      ? this.xyk_pool.get_out_native(foreign_net)
      : 0n;
    const tmc_viable = tmc_quote && tmc_out > 0n && tmc_out >= min_native_out;
    const xyk_viable = xyk_out > 0n && xyk_out >= min_native_out;
    const use_tmc = tmc_viable && (!xyk_viable || tmc_out >= xyk_out);
    if (!use_tmc && !xyk_viable) {
      throw new Error(
        xyk_out > 0n ? "Slippage exceeded" : "No route available",
      );
    }
    this.fee_manager.receive_fee_foreign(foreign_fee);
    return use_tmc
      ? this.#execute_tmc_route(foreign_net, foreign_in, foreign_fee)
      : this.#execute_xyk_route(
          foreign_net,
          foreign_in,
          foreign_fee,
          min_native_out,
        );
  }

  swap_native_to_foreign(
    /** @type {bigint} */ native_in,
    /** @type {bigint} */ min_foreign_out = 0n,
  ) {
    this.#validate_swap_input(native_in, 1n, "Amount must be positive");
    if (!this.xyk_pool.has_liquidity()) {
      throw new Error(
        "Pool not initialized. Cannot sell native tokens before initial liquidity",
      );
    }
    const native_fee = BigMath.mul_div(native_in, this.fee_router_ppm, PPM);
    const native_net = native_in - native_fee;
    const price_spot = this.xyk_pool.get_price();
    if (price_spot === 0n) {
      throw new Error("Invalid pool state: no native reserves");
    }
    const native_net_as_foreign = BigMath.mul_div(
      native_net,
      price_spot,
      PRECISION,
    );
    if (native_net_as_foreign < this.min_swap_foreign) {
      throw new Error(
        `Amount below minimum threshold (${this.min_swap_foreign} foreign equivalent)`,
      );
    }
    this.fee_manager.receive_fee_native(native_fee);
    const swap_result = this.xyk_pool.swap_native_to_foreign(
      native_net,
      min_foreign_out,
    );
    return {
      route: "XYK",
      foreign_out: swap_result.foreign_out,
      native_in: native_in,
      native_router_fee: native_fee,
      native_net: native_net,
      price_before: swap_result.price_before,
      price_after: swap_result.price_after,
      price_impact_ppm: swap_result.price_impact_ppm,
    };
  }

  #validate_swap_input(
    /** @type {bigint} */ amount,
    /** @type {bigint} */ min_threshold,
    /** @type {string} */ error_msg,
  ) {
    if (amount <= 0n) {
      throw new Error("Amount must be positive");
    }
    if (amount < min_threshold) {
      throw new Error(error_msg);
    }
  }

  #execute_tmc_route(
    /** @type {bigint} */ foreign_net,
    /** @type {bigint} */ foreign_in,
    /** @type {bigint} */ foreign_fee,
  ) {
    const mint_result = this.tmc_minter.mint_native(foreign_net);
    return {
      route: "TMC",
      native_out: mint_result.user_native,
      foreign_in: foreign_in,
      foreign_net: foreign_net,
      foreign_router_fee: foreign_fee,
      price_before: mint_result.price_before,
      price_after: mint_result.price_after,
      tol: mint_result.tol,
    };
  }

  #execute_xyk_route(
    /** @type {bigint} */ foreign_net,
    /** @type {bigint} */ foreign_in,
    /** @type {bigint} */ foreign_fee,
    /** @type {bigint} */ min_native_out,
  ) {
    const swap_result = this.xyk_pool.swap_foreign_to_native(
      foreign_net,
      min_native_out,
    );
    return {
      route: "XYK",
      native_out: swap_result.native_out,
      foreign_in: foreign_in,
      foreign_net: foreign_net,
      foreign_router_fee: foreign_fee,
      price_before: swap_result.price_before,
      price_after: swap_result.price_after,
      price_impact_ppm: swap_result.price_impact_ppm,
    };
  }
}

export const create_system = (
  /** @type {Partial<SystemConfig>} */ user_config,
) => {
  const config = { ...DEFAULT_CONFIG, ...user_config };
  const xyk_pool = new XykPool({ fee_ppm: config.fee_xyk_ppm });
  const tol_manager = new TolManager(xyk_pool, config.tol_buckets);
  const tmc_minter = new TmcMinter(
    {
      price_initial: config.price_initial,
      slope: config.slope,
      shares: config.shares,
    },
    tol_manager,
  );
  const fee_manager = new FeeManager(xyk_pool, tmc_minter, {
    min_swap_foreign: config.min_swap_foreign,
  });
  const router = new SmartRouter(xyk_pool, tmc_minter, fee_manager, {
    fee_router_ppm: config.fee_router_ppm,
    min_swap_foreign: config.min_swap_foreign,
    min_initial_foreign: config.min_initial_foreign,
  });
  return {
    xyk_pool,
    tmc_minter,
    fee_manager,
    router,
    tol_manager,
  };
};
