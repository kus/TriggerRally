// Generated by CoffeeScript 1.7.1
(function() {
  define([], function() {
    return {
      create: function(url, name, done) {
        var features, height, left, popup, timer, top, width;
        width = 1000;
        height = 700;
        left = (window.screen.width - width) / 2;
        top = (window.screen.height - height) / 2;
        features = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;
        window._tr_popup_autoclosed = false;
        popup = window.open(url, name, features);
        if (!popup) {
          return false;
        }
        timer = setInterval(function() {
          if (popup.closed) {
            clearInterval(timer);
            return done(window._tr_popup_autoclosed);
          }
        }, 1000);
        return true;
      }
    };
  });

}).call(this);