(function() {
  var exec;

  exec = function() {
    var activeEl, cb, getHref;
    cb = {
      id: 'linkBookmark',
      url: null
    };
    getHref = function(el) {
      if (el.dataset.href != null) {
        return el.dataset.href;
      } else {
        return el.href;
      }
    };
    activeEl = document.activeElement;
    cb.url = getHref(activeEl);
    return chrome.runtime.sendMessage(cb, function() {});
  };

  exec();

}).call(this);

//# sourceMappingURL=exec.js.map