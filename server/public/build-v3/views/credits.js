// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'views/view', 'jade!templates/credits'], function(_, View, template) {
    var CreditsView;
    return CreditsView = (function(_super) {
      __extends(CreditsView, _super);

      CreditsView.prototype.el = '#credits';

      CreditsView.prototype.template = template;

      function CreditsView(app, client) {
        this.app = app;
        this.client = client;
        CreditsView.__super__.constructor.call(this);
      }

      CreditsView.prototype.initialize = function() {
        return this.listenTo(this.app.root, 'change:user', (function(_this) {
          return function() {
            return _this.render();
          };
        })(this));
      };

      CreditsView.prototype.afterRender = function() {
        var $creditsBox, $userCredits, prevCredits, updateCredits;
        $creditsBox = this.$('.credits-box');
        $userCredits = this.$('.usercredits');
        prevCredits = null;
        (updateCredits = (function(_this) {
          return function() {
            var credits, _ref;
            credits = (_ref = _this.app.root.user) != null ? _ref.credits : void 0;
            if (credits != null) {
              $userCredits.text(credits);
              if ((prevCredits != null) && credits > prevCredits) {
                _this.client.playSound('kaching');
                $creditsBox.addClass('flash');
                _.defer(function() {
                  return $creditsBox.removeClass('flash');
                });
              }
            }
            $creditsBox.toggleClass('hidden', credits == null);
            return prevCredits = credits;
          };
        })(this))();
        this.listenTo(this.app.root, 'change:user.credits', updateCredits);
        $userCredits = this.$('.ca-credit.usercredits');
        this.listenTo(this.app.root, 'change:user.credits', (function(_this) {
          return function() {
            var _ref;
            return $userCredits.text((_ref = _this.app.root.user) != null ? _ref.credits : void 0);
          };
        })(this));
        $creditsBox.on('click', (function(_this) {
          return function(event) {
            _this.app.showCreditPurchaseDialog();
            return false;
          };
        })(this));
      };

      return CreditsView;

    })(View);
  });

}).call(this);