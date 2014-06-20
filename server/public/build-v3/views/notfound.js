// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone-full', 'views/view', 'jade!templates/notfound'], function(Backbone, View, template) {
    var NotFoundView;
    return NotFoundView = (function(_super) {
      __extends(NotFoundView, _super);

      function NotFoundView() {
        return NotFoundView.__super__.constructor.apply(this, arguments);
      }

      NotFoundView.prototype.className = 'overlay';

      NotFoundView.prototype.template = template;

      NotFoundView.prototype.afterRender = function() {
        return Backbone.trigger('app:settitle', 'Not Found');
      };

      return NotFoundView;

    })(View);
  });

}).call(this);
