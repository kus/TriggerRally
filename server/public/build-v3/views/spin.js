// Generated by CoffeeScript 1.7.1
(function() {
  define(['backbone-full', 'underscore', 'THREE', 'client/car', 'models/index'], function(Backbone, _, THREE, clientCar, models) {
    var Spin, Vec3;
    Vec3 = THREE.Vector3;
    return Spin = (function() {
      function Spin(app, client) {
        this.app = app;
        this.client = client;
        _.extend(this, Backbone.Events);
      }

      Spin.prototype.destroy = function() {
        var _ref;
        if ((_ref = this.renderCar) != null) {
          _ref.destroy();
        }
        return this.stopListening();
      };

      Spin.prototype.render = function() {
        var root, startpos, track, updateCar, updateStartPos;
        this.startpos = startpos = new THREE.Object3D;
        startpos.position.set(0, 0, 430);
        this.client.scene.add(startpos);
        root = this.app.root;
        (updateStartPos = (function(_this) {
          return function() {
            var startposition, _ref, _ref1;
            if (!root.track) {
              return;
            }
            startposition = root.track.config.course.startposition;
            (_ref = startpos.position).set.apply(_ref, startposition.pos);
            return (_ref1 = startpos.rotation).set.apply(_ref1, startposition.rot);
          };
        })(this))();
        this.listenTo(root, 'change:track.', updateStartPos);
        if (!root.track) {
          track = models.Track.findOrCreate('RF87t6b6');
          track.fetch({
            success: (function(_this) {
              return function() {
                return track.env.fetch({
                  success: function() {
                    if (root.track) {
                      return;
                    }
                    return Backbone.trigger('app:settrack', track);
                  }
                });
              };
            })(this)
          });
        }
        this.renderCar = null;
        (updateCar = (function(_this) {
          return function() {
            var carId, carModel;
            carId = _this.app.root.prefs.car;
            carModel = models.Car.findOrCreate(carId);
            return carModel.fetch({
              success: function() {
                var mockVehicle, _ref;
                mockVehicle = {
                  cfg: carModel.config,
                  body: {
                    interp: {
                      pos: new Vec3(0, 0, 0),
                      ori: (new THREE.Quaternion(1, 1, 1, 1)).normalize()
                    }
                  }
                };
                if ((_ref = _this.renderCar) != null) {
                  _ref.destroy();
                }
                _this.renderCar = new clientCar.RenderCar(startpos, mockVehicle, null);
                return _this.renderCar.update();
              }
            });
          };
        })(this))();
        this.listenTo(this.app.root, 'change:user', updateCar);
        this.listenTo(this.app.root, 'change:user.products', updateCar);
        this.listenTo(this.app.root, 'change:prefs.car', updateCar);
        this.client.camera.idealFov = 50;
        this.client.updateCamera();
        return this;
      };

      Spin.prototype.update = function(deltaTime) {
        var cam, pos, radius, rot;
        cam = this.client.camera;
        cam.useQuaternion = false;
        rot = cam.rotation;
        pos = cam.position;
        rot.x = 1.5;
        rot.z += deltaTime * 0.3;
        radius = 4;
        pos.copy(this.startpos.position);
        pos.x += Math.sin(rot.x) * Math.sin(rot.z) * radius;
        pos.y += Math.sin(rot.x) * Math.cos(rot.z) * -radius;
        return pos.z += 0.5 + Math.cos(rot.x) * radius;
      };

      return Spin;

    })();
  });

}).call(this);
