// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone-full'], function(Backbone) {
    var View;
    return View = (function(_super) {
      __extends(View, _super);

      function View() {
        return View.__super__.constructor.apply(this, arguments);
      }

      View.prototype.viewModel = function() {
        var _ref;
        return (_ref = this.model) != null ? _ref.toJSON() : void 0;
      };

      View.prototype.render = function() {
        var rendered, viewModel;
        this.beforeRender();
        if (this.template) {
          viewModel = this.viewModel();
          rendered = this.template(viewModel);
          this.$el.html(rendered);
        }
        this.afterRender();
        return this;
      };

      View.prototype.beforeRender = function() {};

      View.prototype.afterRender = function() {};

      View.prototype.destroy = function() {
        this.destroyed = true;
        return this.remove();
      };

      return View;

    })(Backbone.View);
  });

}).call(this);
