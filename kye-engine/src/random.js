import Prando from 'prando';

/**
 * This class must be used for random number generation.
 * It is implemented with a Pseudo-random number generator (prng), such that random decisions are
 * repeatable for use in replay validation or testing.
 *
 * Any *non-gameplay* random number generation should still use Math.random.
 **/
export default class Random {
  /**
   * @param {number} seed The seed for the pseudo random number generator.
   */
  constructor(seed) {
    this._pRando = new Prando(seed);
  }

  /**
   * Consume a value from the prng and interpret the result as a boolean
   * @return {boolean}
   **/
  nextBoolean() {
    return this._pRando.nextBoolean();
  }

  /**
   * Consume a value from the prng and interpret the result as an int within the specified bounds
   * @param {number} min The lowest integer which might be randomly returned
   * @param {number} max The highest integer which might be randomly returned
   * @return {boolean} Was the coin heads?
   **/
  nextInt(min, max) {
    return this._pRando.nextInt(min, max);
  }
}
