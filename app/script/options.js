(function() {
  var doc, foldername, foldernameEl, save, saveEl;

  doc = document;

  foldername = null;

  foldernameEl = doc.getElementById('foldername');

  saveEl = doc.getElementById("save");

  save = function() {
    var tgt;
    tgt = null;
    return chrome.bookmarks.getSubTree('1', function(cb) {
      var node, nodes, _i, _len;
      nodes = cb[0].children;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        if (node.title === foldername) {
          tgt = node;
        }
        break;
      }
      if (tgt != null) {
        chrome.bookmarks.update(tgt.id, {
          title: foldernameEl.value
        }, function() {});
      }
      return chrome.storage.local.set({
        foldername: foldernameEl.value
      }, function() {});
    });
  };

  chrome.storage.local.get('foldername', function(cb) {
    foldername = cb.foldername;
    return foldernameEl.value = cb.foldername;
  });

  saveEl.addEventListener('click', save, false);

}).call(this);

//# sourceMappingURL=options.js.map