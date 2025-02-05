import { Utils } from '../utils/Utils'

/**
 * Constraint base class
 * @class Constraint
 * @author schteppe
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {boolean} [options.collideConnected=true]
 * @param {boolean} [options.wakeUpBodies=true]
 */
export class Constraint {
  constructor(bodyA, bodyB, options) {
    options = Utils.defaults(options, {
      collideConnected: true,
      wakeUpBodies: true,
    })

    /**
     * Equations to be solved in this constraint
     * @property equations
     * @type {Array}
     */
    this.equations = []

    /**
     * @property {Body} bodyA
     */
    this.bodyA = bodyA

    /**
     * @property {Body} bodyB
     */
    this.bodyB = bodyB

    /**
     * @property {Number} id
     */
    this.id = Constraint.idCounter++

    /**
     * Set to true if you want the bodies to collide when they are connected.
     * @property collideConnected
     * @type {boolean}
     */
    this.collideConnected = options.collideConnected

    if (options.wakeUpBodies) {
      if (bodyA) {
        bodyA.wakeUp()
      }
      if (bodyB) {
        bodyB.wakeUp()
      }
    }
  }

  /**
   * Update all the equations with data.
   * @method update
   */
  update() {
    throw new Error('method update() not implmemented in this Constraint subclass!')
  }

  /**
   * Enables all equations in the constraint.
   * @method enable
   */
  enable() {
    const eqs = this.equations
    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = true
    }
  }

  /**
   * Disables all equations in the constraint.
   * @method disable
   */
  disable() {
    const eqs = this.equations
    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = false
    }
  }
}

Constraint.idCounter = 0
