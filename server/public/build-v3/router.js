// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone-full', 'models/index', 'views/about', 'views/drive', 'views/editor', 'views/home', 'views/ignition', 'views/license', 'views/mayhem', 'views/packa', 'views/profile', 'views/replay', 'views/spin', 'views/track', 'views/trackset'], function(Backbone, models, AboutView, DriveView, EditorView, HomeView, IgnitionView, LicenseView, MayhemView, PackAView, ProfileView, ReplayView, SpinView, TrackView, TrackSetView) {
    var Router;
    return Router = (function(_super) {
      __extends(Router, _super);

      function Router(app) {
        this.app = app;
        this.uni = this.app.unifiedView;
        Router.__super__.constructor.call(this);
      }

      Router.prototype.routes = {
        //"": "home",
        "": "play",
        "about": "about",
        "ignition": "ignition",
        "license": "license",
        "mayhem": "mayhem",
        "run/:runId/replay": "runReplay",
        "track/:trackId": "track",
        "track/:trackId/": "track",
        "track/:trackId/edit": "trackEdit",
        "track/:trackId/drive": "trackDrive",
        "track/:trackId/drive/vs/:runId": "trackDrive",
        "tracklist/:setId": "trackset",
        "user/:userId": "user",
        "user/:userId/": "user",
        "user/:userId/tracks": "userTracks",
        "user/:userId/favorites": "userFavTracks"
      };

		Router.prototype.play = function() {
			var trackId = 'RF87t6b6';
			var view;
			view = this.uni.getView3D();
			if (!(view instanceof DriveView && view === this.uni.getViewChild())) {
				view = new DriveView(this.app, this.uni.client);
				this.uni.setViewBoth(view);
				view.render();
			}
			view.setTrackId(trackId);
			return view.useChallengeRun();
		};

      Router.prototype.setSpin = function() {
        var view;
        if (!(this.uni.getView3D() instanceof SpinView)) {
          view = new SpinView(this.app, this.uni.client);
          this.uni.setView3D(view);
          return view.render();
        }
      };

      Router.prototype.about = function() {
        var view;
        Backbone.trigger('app:settitle', 'About');
        this.setSpin();
        view = new AboutView(this.app, this.uni.client);
        this.uni.setViewChild(view);
        return view.render();
      };

      Router.prototype.home = function() {
        var view;
        Backbone.trigger('app:settitle', null);
        this.setSpin();
        view = new HomeView(this.app, this.uni.client);
        this.uni.setViewChild(view);
        return view.render();
      };

      Router.prototype.ignition = function() {
        var view;
        Backbone.trigger('app:settitle', 'Ignition Pack');
        this.setSpin();
        view = new IgnitionView(this.app, this.uni.client);
        this.uni.setViewChild(view);
        return view.render();
      };

      Router.prototype.license = function() {
        var view;
        Backbone.trigger('app:settitle', 'License and Terms of Use');
        this.setSpin();
        view = new LicenseView(this.app, this.uni.client);
        return this.uni.setViewChild(view.render());
      };

      Router.prototype.mayhem = function() {
        var view;
        Backbone.trigger('app:settitle', 'Mayhem Pack');
        this.setSpin();
        view = new MayhemView(this.app, this.uni.client);
        this.uni.setViewChild(view);
        return view.render();
      };

      Router.prototype.packA = function() {
        var view;
        Backbone.trigger('app:settitle', 'Purchase');
        this.setSpin();
        view = new PackAView(this.app, this.uni.client);
        this.uni.setViewChild(view);
        return view.render();
      };

      Router.prototype.runReplay = function(runId) {
        var run, view;
        view = this.uni.getView3D();
        if (!(view instanceof ReplayView && view === this.uni.getViewChild())) {
          run = models.Run.findOrCreate(runId);
          view = new ReplayView(this.app, this.uni.client, run);
          this.uni.setViewBoth(view);
          return view.render();
        }
      };

      Router.prototype.track = function(trackId) {
        var track, view;
        this.setSpin();
        track = models.Track.findOrCreate(trackId);
        view = new TrackView(track, this.app, this.uni.client);
        return this.uni.setViewChild(view.render());
      };

      Router.prototype.trackDrive = function(trackId, runId) {
        var view;
        view = this.uni.getView3D();
        if (!(view instanceof DriveView && view === this.uni.getViewChild())) {
          view = new DriveView(this.app, this.uni.client);
          this.uni.setViewBoth(view);
          view.render();
        }
        view.setTrackId(trackId);
        if (runId) {
          return view.setRunId(runId);
        } else {
          return view.useChallengeRun();
        }
      };

      Router.prototype.trackEdit = function(trackId) {
        var track, view;
        if (!(this.uni.getView3D() instanceof EditorView && this.uni.getView3D() === this.uni.getViewChild())) {
          view = new EditorView(this.app, this.uni.client);
          this.uni.setViewBoth(view);
          view.render();
        }
        track = models.Track.findOrCreate(trackId);
        return track.fetch({
          success: function() {
            return track.env.fetch({
              success: function() {
                Backbone.trigger("app:settrack", track, true);
                return Backbone.trigger('app:settitle', "Edit " + track.name);
              }
            });
          },
          error: function() {
            return Backbone.trigger('app:notfound');
          }
        });
      };

      Router.prototype.trackset = function(setId) {
        var trackSet, view;
        this.setSpin();
        trackSet = models.TrackSet.findOrCreate(setId);
        trackSet.fetch();
        view = new TrackSetView(trackSet, this.app, this.uni.client);
        return this.uni.setViewChild(view.render());
      };

      Router.prototype.user = function(userId) {
        var user, view;
        this.setSpin();
        user = models.User.findOrCreate(userId);
        view = new ProfileView(user, this.app, this.uni.client);
        return this.uni.setViewChild(view.render());
      };

      Router.prototype.userFavTracks = function(userId) {
        var user;
        this.setSpin();
        user = models.User.findOrCreate(userId);
        return user.fetch({
          success: (function(_this) {
            return function() {
              var favTracks, trackId, trackSet, view;
              favTracks = (function() {
                var _i, _len, _ref, _results;
                _ref = user.favorite_tracks;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  trackId = _ref[_i];
                  _results.push(models.Track.findOrCreate(trackId));
                }
                return _results;
              })();
              trackSet = new models.TrackSet({
                name: "" + user.name + "'s Favorites",
                tracks: new models.TrackCollection(favTracks)
              });
              view = new TrackSetView(trackSet, _this.app, _this.uni.client);
              return _this.uni.setViewChild(view.render());
            };
          })(this),
          error: function() {
            return Backbone.trigger('app:notfound');
          }
        });
      };

      Router.prototype.userTracks = function(userId) {
        var user;
        this.setSpin();
        user = models.User.findOrCreate(userId);
        return user.fetch({
          success: (function(_this) {
            return function() {
              var trackSet, view;
              trackSet = new models.TrackSet({
                name: "" + user.name + "'s Tracks",
                tracks: new models.TrackCollectionSortModified(user.tracks.models)
              });
              trackSet.tracks.on('change:modified', function() {
                return trackSet.tracks.sort();
              });
              view = new TrackSetView(trackSet, _this.app, _this.uni.client);
              return _this.uni.setViewChild(view.render());
            };
          })(this),
          error: function() {
            return Backbone.trigger('app:notfound');
          }
        });
      };

      return Router;

    })(Backbone.Router);
  });

}).call(this);