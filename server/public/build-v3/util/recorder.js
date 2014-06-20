// Generated by CoffeeScript 1.7.1
(function() {
  var moduleDef;

  moduleDef = function(require, exports, module) {
    var applyDiff, blendDiff, filterObject, generateKeyMap, objDiff, remapKeys, _;
    _ = require('underscore');
    exports.StateSampler = (function() {
      function StateSampler(object, keys, freq, changeHandler) {
        this.object = object;
        this.keys = keys;
        this.freq = freq != null ? freq : 1;
        this.changeHandler = changeHandler;
        this.keyMap = generateKeyMap(keys);
        this.restart();
      }

      StateSampler.prototype.restart = function() {
        this.lastState = null;
        return this.counter = -1;
      };

      StateSampler.prototype.observe = function() {
        var newState, remapped, stateDiff;
        ++this.counter;
        if (this.counter % this.freq !== 0) {
          return;
        }
        newState = filterObject(this.object, this.keys);
        if (this.lastState) {
          stateDiff = objDiff(newState, this.lastState);
          if (_.isEmpty(stateDiff)) {
            return;
          }
          this.lastState = newState;
        } else {
          this.lastState = stateDiff = newState;
        }
        remapped = remapKeys(stateDiff, this.keyMap);
        this.changeHandler(this.counter, remapped);
        return this.counter = 0;
      };

      StateSampler.prototype.toJSON = function() {
        return {
          keyMap: _.invert(this.keyMap)
        };
      };

      return StateSampler;

    })();
    exports.StateRecorder = (function() {
      function StateRecorder(object, keys, freq) {
        this.object = object;
        this.keys = keys;
        this.freq = freq;
        this.restart();
      }

      StateRecorder.prototype.restart = function() {
        var changeHandler, timeline;
        this.timeline = timeline = [];
        changeHandler = function(offset, state) {
          return timeline.push([offset, state]);
        };
        return this.sampler = new exports.StateSampler(this.object, this.keys, this.freq, changeHandler);
      };

      StateRecorder.prototype.observe = function() {
        return this.sampler.observe();
      };

      StateRecorder.prototype.toJSON = function() {
        return {
          keyMap: this.sampler.toJSON().keyMap,
          timeline: this.timeline
        };
      };

      return StateRecorder;

    })();
    exports.StatePlayback = (function() {
      function StatePlayback(object, saved) {
        this.object = object;
        this.saved = saved;
        this.restart();
      }

      StatePlayback.prototype.restart = function() {
        this.counter = -1;
        return this.currentSeg = -1;
      };

      StatePlayback.prototype.step = function() {
        var duration, seg, timeline;
        timeline = this.saved.timeline;
        ++this.counter;
        while ((seg = timeline[this.currentSeg + 1]) && (duration = seg[0]) <= this.counter) {
          ++this.currentSeg;
          applyDiff(this.object, timeline[this.currentSeg][1], this.saved.keyMap);
          this.counter -= duration;
        }
      };

      StatePlayback.prototype.complete = function() {
        return timeline[this.currentSeg + 1] != null;
      };

      return StatePlayback;

    })();
    exports.StatePlaybackInterpolated = (function() {
      function StatePlaybackInterpolated(object, saved) {
        this.object = object;
        this.saved = saved;
        this.restart();
      }

      StatePlaybackInterpolated.prototype.restart = function() {
        this.counter = -1;
        this.currentSeg = -1;
        return this.cache = {};
      };

      StatePlaybackInterpolated.prototype.step = function() {
        var duration, factor, keyMap, nextSeg, timeline;
        timeline = this.saved.timeline;
        ++this.counter;
        keyMap = this.saved.keyMap;
        while ((nextSeg = timeline[this.currentSeg + 1]) && (duration = nextSeg[0]) <= this.counter) {
          applyDiff(this.cache, nextSeg[1], keyMap);
          ++this.currentSeg;
          this.counter -= duration;
        }
        if (this.currentSeg < 0) {
          return;
        }
        factor = this.counter / duration;
        if (nextSeg) {
          blendDiff(this.object, this.cache, nextSeg[1], keyMap, factor);
        } else {
          applyDiff(this.object, timeline[this.currentSeg][1], keyMap);
        }
      };

      StatePlaybackInterpolated.prototype.complete = function() {
        return timeline[this.currentSeg + 1] != null;
      };

      return StatePlaybackInterpolated;

    })();
    objDiff = function(a, b) {
      var aVal, c, changed, k;
      changed = {};
      for (k in a) {
        aVal = a[k];
        if (_.isArray(aVal)) {
          changed[k] = aVal;
        } else if (typeof aVal === 'object') {
          c = objDiff(aVal, b[k]);
          if (!_.isEmpty(c)) {
            changed[k] = c;
          }
        } else {
          if (aVal !== b[k]) {
            changed[k] = aVal;
          }
        }
      }
      return changed;
    };
    applyDiff = function(obj, diff, keyMap) {
      var el, index, key, mapped, val, _i, _len;
      if (_.isArray(diff)) {
        if (obj == null) {
          obj = [];
        }
        for (index = _i = 0, _len = diff.length; _i < _len; index = ++_i) {
          el = diff[index];
          obj[index] = applyDiff(obj[index], el, keyMap);
        }
      } else if (_.isObject(diff)) {
        if (obj == null) {
          obj = {};
        }
        for (key in diff) {
          val = diff[key];
          mapped = keyMap[key];
          obj[mapped] = applyDiff(obj[mapped], val, keyMap);
        }
      } else {
        obj = parseFloat(diff);
      }
      return obj;
    };
    blendDiff = function(obj, lastState, diff, keyMap, factor) {
      var el, index, key, mapped, target, val, _i, _len;
      if (_.isArray(diff)) {
        for (index = _i = 0, _len = diff.length; _i < _len; index = ++_i) {
          el = diff[index];
          obj[index] = blendDiff(obj[index], lastState[index], el, keyMap, factor);
        }
      } else if (_.isObject(diff)) {
        for (key in diff) {
          val = diff[key];
          mapped = keyMap[key];
          obj[mapped] = blendDiff(obj[mapped], lastState[mapped], val, keyMap, factor);
        }
      } else {
        target = parseFloat(diff);
        obj = lastState + (target - lastState) * factor;
      }
      return obj;
    };
    generateKeyMap = function(keys) {
      var keyMap, nextKey, process;
      keyMap = {};
      nextKey = 0;
      (process = function(keys) {
        var key, val, _results;
        _results = [];
        for (key in keys) {
          val = keys[key];
          if (!(key in keyMap)) {
            keyMap[key] = (nextKey++).toString(36);
          }
          if (_.isArray(val)) {
            _results.push(process(val[0]));
          } else if (typeof val === 'object') {
            _results.push(process(val));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      })(keys);
      return keyMap;
    };
    remapKeys = function(object, keyMap) {
      var el, objKey, remapped, val, _i, _len, _results;
      if (_.isArray(object)) {
        _results = [];
        for (_i = 0, _len = object.length; _i < _len; _i++) {
          el = object[_i];
          _results.push(remapKeys(el, keyMap));
        }
        return _results;
      } else if (_.isObject(object)) {
        remapped = {};
        for (objKey in object) {
          val = object[objKey];
          remapped[keyMap[objKey]] = remapKeys(val, keyMap);
        }
        return remapped;
      } else {
        return object;
      }
    };
    filterObject = function(obj, keys) {
      var el, key, result, subKeys, val, _i, _len, _results;
      if (_.isArray(keys)) {
        subKeys = keys[0];
        _results = [];
        for (_i = 0, _len = obj.length; _i < _len; _i++) {
          el = obj[_i];
          _results.push(filterObject(el, subKeys));
        }
        return _results;
      } else if (_.isObject(keys)) {
        result = {};
        for (key in keys) {
          val = keys[key];
          result[key] = filterObject(obj[key], val);
        }
        return result;
      } else {
        return obj.toFixed(keys).replace(/\.0*$/, '');
      }
    };
    return exports;
  };

  if (typeof define !== "undefined" && define !== null) {
    define(moduleDef);
  } else if (typeof exports !== "undefined" && exports !== null) {
    moduleDef(require, exports, module);
  }

}).call(this);