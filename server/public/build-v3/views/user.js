// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['views/view', 'jade!templates/user', 'jade!templates/userstatus'], function(View, templateBasic, templateWithStatus) {
    var UserView;
    return UserView = (function(_super) {
      __extends(UserView, _super);

      function UserView() {
        return UserView.__super__.constructor.apply(this, arguments);
      }

      UserView.prototype.tagName = 'span';

      UserView.prototype.initialize = function() {
        var _ref;
        UserView.__super__.initialize.apply(this, arguments);
        this.render();
        if (this.model) {
          this.listenTo(this.model, 'change', (function(_this) {
            return function() {
              return _this.render();
            };
          })(this));
        }
        return (_ref = this.model) != null ? _ref.fetch() : void 0;
      };

      UserView.prototype.template = function(viewModel) {
        var template;
        template = this.options.showStatus ? templateWithStatus : templateBasic;
        return template(viewModel);
      };

      UserView.prototype.viewModel = function() {
        var img_src, _ref, _ref1;
        img_src = "/images/profile/" + ((_ref = (_ref1 = this.model) != null ? _ref1.picture : void 0) != null ? _ref : "blank") + ".jpg";
        return {
          user: this.model,
          img_src: img_src
        };
      };

      return UserView;

    })(View);
  });

}).call(this);
