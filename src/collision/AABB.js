import { Vec3 } from '../math/Vec3'
import { Utils } from '../utils/Utils'

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object} [options]
 * @param {Vec3}   [options.upperBound]
 * @param {Vec3}   [options.lowerBound]
 */
export class AABB {
  constructor(options = {}) {
    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Vec3}
     */
    this.lowerBound = new Vec3()
    if (options.lowerBound) {
      this.lowerBound.copy(options.lowerBound)
    }

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Vec3}
     */
    this.upperBound = new Vec3()
    if (options.upperBound) {
      this.upperBound.copy(options.upperBound)
    }
  }

  /**
   * Set the AABB bounds from a set of points.
   * @method setFromPoints
   * @param {Array} points An array of Vec3's.
   * @param {Vec3} position
   * @param {Quaternion} quaternion
   * @param {number} skinSize
   * @return {AABB} The self object
   */
  setFromPoints(points, position, quaternion, skinSize) {
    const l = this.lowerBound
    const u = this.upperBound
    const q = quaternion

    // Set to the first point
    l.copy(points[0])
    if (q) {
      q.vmult(l, l)
    }
    u.copy(l)

    for (let i = 1; i < points.length; i++) {
      let p = points[i]

      if (q) {
        q.vmult(p, tmp)
        p = tmp
      }

      if (p.x > u.x) {
        u.x = p.x
      }
      if (p.x < l.x) {
        l.x = p.x
      }
      if (p.y > u.y) {
        u.y = p.y
      }
      if (p.y < l.y) {
        l.y = p.y
      }
      if (p.z > u.z) {
        u.z = p.z
      }
      if (p.z < l.z) {
        l.z = p.z
      }
    }

    // Add offset
    if (position) {
      position.vadd(l, l)
      position.vadd(u, u)
    }

    if (skinSize) {
      l.x -= skinSize
      l.y -= skinSize
      l.z -= skinSize
      u.x += skinSize
      u.y += skinSize
      u.z += skinSize
    }

    return this
  }

  /**
   * Copy bounds from an AABB to this AABB
   * @method copy
   * @param  {AABB} aabb Source to copy from
   * @return {AABB} The this object, for chainability
   */
  copy({ lowerBound, upperBound }) {
    this.lowerBound.copy(lowerBound)
    this.upperBound.copy(upperBound)
    return this
  }

  /**
   * Clone an AABB
   * @method clone
   */
  clone() {
    return new AABB().copy(this)
  }

  /**
   * Extend this AABB so that it covers the given AABB too.
   * @method extend
   * @param  {AABB} aabb
   */
  extend({ lowerBound, upperBound }) {
    this.lowerBound.x = Math.min(this.lowerBound.x, lowerBound.x)
    this.upperBound.x = Math.max(this.upperBound.x, upperBound.x)
    this.lowerBound.y = Math.min(this.lowerBound.y, lowerBound.y)
    this.upperBound.y = Math.max(this.upperBound.y, upperBound.y)
    this.lowerBound.z = Math.min(this.lowerBound.z, lowerBound.z)
    this.upperBound.z = Math.max(this.upperBound.z, upperBound.z)
  }

  /**
   * Returns true if the given AABB overlaps this AABB.
   * @method overlaps
   * @param  {AABB} aabb
   * @return {Boolean}
   */
  overlaps({ lowerBound, upperBound }) {
    const l1 = this.lowerBound
    const u1 = this.upperBound
    const l2 = lowerBound
    const u2 = upperBound

    //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    const overlapsX = (l2.x <= u1.x && u1.x <= u2.x) || (l1.x <= u2.x && u2.x <= u1.x)
    const overlapsY = (l2.y <= u1.y && u1.y <= u2.y) || (l1.y <= u2.y && u2.y <= u1.y)
    const overlapsZ = (l2.z <= u1.z && u1.z <= u2.z) || (l1.z <= u2.z && u2.z <= u1.z)

    return overlapsX && overlapsY && overlapsZ
  }

  // Mostly for debugging
  volume() {
    const l = this.lowerBound
    const u = this.upperBound
    return (u.x - l.x) * (u.y - l.y) * (u.z - l.z)
  }

  /**
   * Returns true if the given AABB is fully contained in this AABB.
   * @method contains
   * @param {AABB} aabb
   * @return {Boolean}
   */
  contains({ lowerBound, upperBound }) {
    const l1 = this.lowerBound
    const u1 = this.upperBound
    const l2 = lowerBound
    const u2 = upperBound

    //      l2        u2
    //      |---------|
    // |---------------|
    // l1              u1

    return l1.x <= l2.x && u1.x >= u2.x && l1.y <= l2.y && u1.y >= u2.y && l1.z <= l2.z && u1.z >= u2.z
  }

  /**
   * @method getCorners
   * @param {Vec3} a
   * @param {Vec3} b
   * @param {Vec3} c
   * @param {Vec3} d
   * @param {Vec3} e
   * @param {Vec3} f
   * @param {Vec3} g
   * @param {Vec3} h
   */
  getCorners(a, b, c, d, e, f, g, h) {
    const l = this.lowerBound
    const u = this.upperBound

    a.copy(l)
    b.set(u.x, l.y, l.z)
    c.set(u.x, u.y, l.z)
    d.set(l.x, u.y, u.z)
    e.set(u.x, l.y, l.z)
    f.set(l.x, u.y, l.z)
    g.set(l.x, l.y, u.z)
    h.copy(u)
  }

  /**
   * Get the representation of an AABB in another frame.
   * @method toLocalFrame
   * @param  {Transform} frame
   * @param  {AABB} target
   * @return {AABB} The "target" AABB object.
   */
  toLocalFrame(frame, target) {
    const corners = transformIntoFrame_corners
    const a = corners[0]
    const b = corners[1]
    const c = corners[2]
    const d = corners[3]
    const e = corners[4]
    const f = corners[5]
    const g = corners[6]
    const h = corners[7]

    // Get corners in current frame
    this.getCorners(a, b, c, d, e, f, g, h)

    // Transform them to new local frame
    for (let i = 0; i !== 8; i++) {
      const corner = corners[i]
      frame.pointToLocal(corner, corner)
    }

    return target.setFromPoints(corners)
  }

  /**
   * Get the representation of an AABB in the global frame.
   * @method toWorldFrame
   * @param  {Transform} frame
   * @param  {AABB} target
   * @return {AABB} The "target" AABB object.
   */
  toWorldFrame(frame, target) {
    const corners = transformIntoFrame_corners
    const a = corners[0]
    const b = corners[1]
    const c = corners[2]
    const d = corners[3]
    const e = corners[4]
    const f = corners[5]
    const g = corners[6]
    const h = corners[7]

    // Get corners in current frame
    this.getCorners(a, b, c, d, e, f, g, h)

    // Transform them to new local frame
    for (let i = 0; i !== 8; i++) {
      const corner = corners[i]
      frame.pointToWorld(corner, corner)
    }

    return target.setFromPoints(corners)
  }

  /**
   * Check if the AABB is hit by a ray.
   * @param  {Ray} ray
   * @return {number}
   */
  overlapsRay({ _direction, from }) {
    const t = 0

    // ray.direction is unit direction vector of ray
    const dirFracX = 1 / _direction.x
    const dirFracY = 1 / _direction.y
    const dirFracZ = 1 / _direction.z

    // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    const t1 = (this.lowerBound.x - from.x) * dirFracX
    const t2 = (this.upperBound.x - from.x) * dirFracX
    const t3 = (this.lowerBound.y - from.y) * dirFracY
    const t4 = (this.upperBound.y - from.y) * dirFracY
    const t5 = (this.lowerBound.z - from.z) * dirFracZ
    const t6 = (this.upperBound.z - from.z) * dirFracZ

    // var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    // var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));
    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6))
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6))

    // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmax < 0) {
      //t = tmax;
      return false
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax) {
      //t = tmax;
      return false
    }

    return true
  }
}

const tmp = new Vec3()

const transformIntoFrame_corners = [
  new Vec3(),
  new Vec3(),
  new Vec3(),
  new Vec3(),
  new Vec3(),
  new Vec3(),
  new Vec3(),
  new Vec3(),
]
