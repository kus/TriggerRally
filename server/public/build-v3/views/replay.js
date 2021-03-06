// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'backbone-full', 'THREE', 'util/util', 'util/util2', 'client/car', 'client/editor_camera', 'game/game', 'game/track', 'models/index', 'views/view', 'jade!templates/drive', 'util/recorder'], function($, Backbone, THREE, util, util2, clientCar, EditorCameraControl, gameGame, gameTrack, models, View, template, recorder) {
    var KEYCODE, MB, Replay, Vec3, formatRunTime, padZero;
    MB = util2.MB;
    KEYCODE = util.KEYCODE;
    Vec3 = THREE.Vector3;
    padZero = function(val, digits) {
      return (1e15 + val + '').slice(-digits);
    };
    formatRunTime = function(time) {
      var cents, mins, secs;
      mins = Math.floor(time / 60);
      time -= mins * 60;
      secs = Math.floor(time);
      time -= secs;
      cents = Math.floor(time * 100);
      return mins + ':' + padZero(secs, 2) + '.' + padZero(cents, 2);
    };
    return Replay = (function(_super) {
      __extends(Replay, _super);

      Replay.prototype.template = template;

      Replay.prototype.className = 'no-pointer-events';

      function Replay(app, client, run) {
        this.app = app;
        this.client = client;
        this.run = run;
        Replay.__super__.constructor.call(this);
      }

      Replay.prototype.destroy = function() {
        var _ref;
        if ((_ref = this.game) != null) {
          _ref.destroy();
        }
        return Replay.__super__.destroy.apply(this, arguments);
      };

      Replay.prototype.onKeyDown = function(event) {
        var _ref;
        switch (event.keyCode) {
          case KEYCODE['C']:
            return (_ref = this.client.camControl) != null ? _ref.nextMode() : void 0;
          case KEYCODE['R']:
            if (this.game) {
              return this.restartGame();
            }
        }
      };

      Replay.prototype.afterRender = function() {
        var client, root, run;
        client = this.client;
        client.camera.idealFov = 75;
        client.camera.useQuaternion = false;
        client.updateCamera();
        this.camControl = new EditorCameraControl(client.camera);
        this.cursor = {
          hit: null,
          pos: new Vec3
        };
        this.buttons = this.mouseX = this.mouseY = 0;
        this.$countdown = this.$('#countdown');
        this.$runTimer = this.$('#timer');
        this.$checkpoints = this.$('#checkpoints');
        this.game = null;
        root = this.app.root;
        this.lastRaceTime = 0;
        this.updateTimer = true;
        run = this.run;
        return run.fetch({
          success: (function(_this) {
            return function() {
              var car, done, track;
              done = _.after(2, function() {
                var _ref;
                if ((_ref = _this.game) != null) {
                  _ref.destroy();
                }
                _this.game = new gameGame.Game(_this.client.track);
                _this.client.addGame(_this.game);
                return _this.game.addCarConfig(car.config, function(progress) {
                  var obj1, obj2;
                  _this.progress = progress;
                  progress.vehicle.cfg.isReplay = true;
                  progress.on('advance', function() {
                    var cpNext, cpTotal;
                    cpNext = progress.nextCpIndex;
                    cpTotal = root.track.config.course.checkpoints.length;
                    _this.$checkpoints.html("" + cpNext + " / " + cpTotal);
                    if (progress.nextCheckpoint(0)) {
                      return;
                    }
                    _this.updateTimer = false;
                    return _this.$runTimer.removeClass('running');
                  });
                  obj1 = progress.vehicle.controller.input;
                  obj2 = progress;
                  _this.play1 = new recorder.StatePlaybackInterpolated(obj1, run.record_i);
                  _this.play2 = new recorder.StatePlaybackInterpolated(obj2, run.record_p);
                  _this.game.sim.pubsub.on('step', function() {
                    _this.play1.step();
                    return _this.play2.step();
                  });
                  return _this.restartGame();
                });
              });
              track = models.Track.findOrCreate(run.track.id);
              track.fetch({
                success: function() {
                  var startposition;
                  startposition = track.config.course.startposition;
                  _this.camControl.autoTo(startposition.pos, startposition.rot);
                  return track.env.fetch({
                    success: function() {
                      Backbone.trigger('app:settrack', track);
                      Backbone.trigger('app:settitle', track.name);
                      return done();
                    }
                  });
                }
              });
              car = models.Car.findOrCreate(run.car.id);
              return car.fetch({
                success: done
              });
            };
          })(this),
          error: function() {
            return Backbone.trigger('app:notfound');
          }
        });
      };

      Replay.prototype.restartGame = function() {
        this.updateTimer = true;
        this.$runTimer.addClass('running');
        this.game.restart();
        this.play1.object = this.progress.vehicle.controller.input;
        this.play1.restart();
        return this.play2.restart();
      };

      Replay.prototype.update = function(delta) {
        var lastNum, num, raceTime, terrainHeight;
        terrainHeight = 0;
        if (this.client.track != null) {
          terrainHeight = (this.client.track.terrain.getContactRayZ(this.camControl.pos.x, this.camControl.pos.y)).surfacePos.z;
        }
        this.camControl.update(delta, this.client.keyDown, terrainHeight);
        if (this.updateTimer && this.game) {
          raceTime = this.game.interpolatedRaceTime();
          if (raceTime >= 0) {
            if (this.lastRaceTime < 0) {
              this.$countdown.html('Go!');
              this.$countdown.addClass('fadeout');
            }
            this.$runTimer.html(formatRunTime(raceTime));
          } else {
            num = Math.ceil(-raceTime);
            lastNum = Math.ceil(-this.lastRaceTime);
            if (num !== lastNum) {
              this.$runTimer.html("");
              this.$countdown.html('' + num);
              this.$countdown.removeClass('fadeout');
            }
          }
          return this.lastRaceTime = raceTime;
        }
      };

      Replay.prototype.onMouseDown = function(event) {
        this.buttons |= 1 << event.button;
        event.preventDefault();
        return false;
      };

      Replay.prototype.onMouseUp = function(event) {
        this.buttons &= ~(1 << event.button);
        event.preventDefault();
        return false;
      };

      Replay.prototype.findObject = function(mouseX, mouseY) {
        var isect, obj, _i, _len;
        isect = this.client.findObject(mouseX, mouseY);
        for (_i = 0, _len = isect.length; _i < _len; _i++) {
          obj = isect[_i];
          if (obj.type === 'terrain') {
            obj.distance += 10;
          }
        }
        isect.sort(function(a, b) {
          return a.distance > b.distance;
        });
        return isect[0];
      };

      Replay.prototype.onMouseMove = function(event) {
        var angX, angZ, cursorPos, motionX, motionY, planeHit, relMotion, rotateMode, viewRay;
        motionX = event.offsetX - this.mouseX;
        motionY = event.offsetY - this.mouseY;
        angX = motionY * 0.01;
        angZ = motionX * 0.01;
        this.mouseX = event.offsetX;
        this.mouseY = event.offsetY;
        if (!(this.buttons & (MB.LEFT | MB.MIDDLE) && this.cursor.hit)) {
          this.cursor.hit = this.findObject(this.mouseX, this.mouseY);
          if (this.cursor.hit) {
            Vec3.prototype.set.apply(this.cursor.pos, this.cursor.hit.object.pos);
          }
        } else {
          rotateMode = (event.altKey && this.buttons & MB.LEFT) || this.buttons & MB.MIDDLE;
          viewRay = this.client.viewRay(this.mouseX, this.mouseY);
          cursorPos = this.cursor.pos;
          planeHit = event.shiftKey ? util2.intersectZLine(viewRay, cursorPos) : util2.intersectZPlane(viewRay, cursorPos);
          if (!planeHit) {
            return;
          }
          relMotion = planeHit.pos.clone().subSelf(cursorPos);
          if (rotateMode) {
            this.camControl.rotate(cursorPos, angX, angZ);
          } else {
            relMotion.multiplyScalar(-1);
            this.camControl.translate(relMotion);
          }
        }
      };

      Replay.prototype.scroll = function(scrollY, event) {
        var vec;
        if (!this.cursor.hit) {
          return;
        }
        vec = this.camControl.pos.clone().subSelf(this.cursor.pos);
        vec.multiplyScalar(Math.exp(scrollY * -0.002) - 1);
        this.camControl.translate(vec);
        event.preventDefault();
      };

      Replay.prototype.onMouseWheel = function(event) {
        var deltaY, origEvent, _ref;
        origEvent = event.originalEvent;
        deltaY = (_ref = origEvent.wheelDeltaY) != null ? _ref : origEvent.deltaY;
        return this.scroll(deltaY, event);
      };

      return Replay;

    })(View);
  });

}).call(this);
