// Generated by CoffeeScript 1.7.1
(function() {
  define(['THREE'], function(THREE) {
    var MB, Vec3, intersectZLine, intersectZPlane, plusZVec3, tmpVec3, tmpVec3b;
    MB = {
      LEFT: 1,
      MIDDLE: 2,
      RIGHT: 4
    };
    Vec3 = THREE.Vector3;
    tmpVec3 = new Vec3;
    tmpVec3b = new Vec3;
    plusZVec3 = new Vec3(0, 0, 1);
    intersectZLine = function(ray, pos) {
      var dot, isect, lambda, normal, sideways;
      sideways = tmpVec3.cross(ray.direction, plusZVec3);
      normal = tmpVec3b.cross(tmpVec3, plusZVec3);
      normal.normalize();
      dot = normal.dot(ray.direction);
      if (Math.abs(dot) < 1e-10) {
        return null;
      }
      tmpVec3.sub(pos, ray.origin);
      lambda = tmpVec3.dot(normal) / dot;
      if (lambda < ray.near) {
        return null;
      }
      isect = ray.direction.clone();
      isect.multiplyScalar(lambda).addSelf(ray.origin);
      isect.x = pos.x;
      isect.y = pos.y;
      return {
        pos: isect,
        distance: lambda
      };
    };
    intersectZPlane = function(ray, pos) {
      var diff, isect, lambda;
      if (Math.abs(ray.direction.z) < 1e-10) {
        return null;
      }
      lambda = (pos.z - ray.origin.z) / ray.direction.z;
      if (lambda < ray.near) {
        return null;
      }
      isect = ray.direction.clone();
      isect.multiplyScalar(lambda).addSelf(ray.origin);
      isect.z = pos.z;
      diff = isect.clone().subSelf(pos);
      return {
        pos: isect,
        distance: lambda
      };
    };
    return {
      MB: MB,
      intersectZLine: intersectZLine,
      intersectZPlane: intersectZPlane
    };
  });

}).call(this);
