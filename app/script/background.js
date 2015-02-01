(function() {
  var addBookmark, createFolder, cutTitle, executeScripts, filterNodeByTitle, filterTitlesIdByTitle, getId, getRootFolderName, getText, getTitlesParentId, getTreeNodes, ids, insertCSSs, isURL, makeFolderParams, now, rootFoldername, tabId, titles;

  now = moment();

  rootFoldername = null;

  tabId = null;

  ids = {
    root: null,
    year: null,
    month: null,
    date: null
  };

  titles = {
    root: 'とりブ',
    year: '' + now.year(),
    month: '' + (now.month() + 1),
    date: '' + now.date()
  };

  chrome.runtime.onInstalled.addListener(function() {
    return chrome.storage.local.get('foldername', function(cb) {
      if (cb.foldername == null) {
        return chrome.storage.local.set({
          foldername: titles.root
        }, function() {});
      }
    });
  });

  isURL = function(str) {
    var re;
    re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return re.test(str);
  };

  insertCSSs = function(id, files) {
    var file, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      _results.push(chrome.tabs.insertCSS(id, {
        file: "style/" + file
      }, function() {}));
    }
    return _results;
  };

  executeScripts = function(id, files) {
    var file, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      _results.push(chrome.tabs.executeScript(id, {
        file: "script/" + file
      }, function() {}));
    }
    return _results;
  };

  getText = function(url) {
    return new Promise(function(resolve, reject) {
      var xhr;
      if (isURL(url)) {
        xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            return resolve(xhr.responseText);
          }
        };
        return xhr.send();
      } else {
        return reject(123);
      }
    });
  };

  cutTitle = function(txt) {
    return new Promise(function(resolve) {
      var re;
      re = /<title>(.*)<\/title>/i;
      return resolve(txt.match(re)[1]);
    });
  };

  getRootFolderName = function() {
    return new Promise(function(resolve) {
      return chrome.storage.local.get('foldername', function(cb) {
        return resolve(cb.foldername);
      });
    });
  };

  makeFolderParams = function(folderType) {
    var params;
    params = {
      index: 0,
      parentId: null,
      title: null
    };
    switch (folderType) {
      case 'root':
        params.parentId = '1';
        params.title = titles.root;
        break;
      case 'year':
        params.parentId = '' + ids.root;
        params.title = '' + titles.year;
        break;
      case 'month':
        params.parentId = '' + ids.year;
        params.title = '' + titles.month;
        break;
      case 'date':
        params.parentId = '' + ids.month;
        params.title = '' + titles.date;
    }
    return params;
  };

  createFolder = function(folderType) {
    var folderParams;
    folderParams = makeFolderParams(folderType);
    return new Promise(function(resolve) {
      return chrome.bookmarks.create(folderParams, function(bookmark) {
        return resolve(bookmark.id);
      });
    });
  };

  filterNodeByTitle = function(nodes, title) {
    var eqNode, node, _i, _len;
    eqNode = null;
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      if (node.title === title) {
        eqNode = node;
        break;
      }
    }
    return Promise.resolve(eqNode);
  };

  getTreeNodes = function(parentId) {
    return new Promise(function(resolve) {
      return chrome.bookmarks.getSubTree(parentId, function(cb) {
        return resolve(cb[0].children);
      });
    });
  };

  filterTitlesIdByTitle = function(parentId, title) {
    return new Promise(function(resolve, reject) {
      return getTreeNodes(parentId).then(function(nodes) {
        return filterNodeByTitle(nodes, title);
      }).done(function(node) {
        if (node != null) {
          return resolve(node.id);
        } else {
          return reject();
        }
      });
    });
  };

  getTitlesParentId = function(type) {
    switch (type) {
      case 'root':
        return '1';
      case 'year':
        return ids.root;
      case 'month':
        return ids.year;
      case 'date':
        return ids.month;
    }
  };

  getId = function(folderType) {
    var id;
    id = getTitlesParentId(folderType);
    return new Promise(function(resolve) {
      return filterTitlesIdByTitle(id, titles[folderType])["catch"](function() {
        return createFolder(folderType);
      }).done(function(id) {
        return resolve(id);
      });
    });
  };

  addBookmark = function(tab) {
    return getRootFolderName().then(function(name) {
      titles.root = name;
      return getId('root');
    }).then(function(rootId) {
      ids.root = rootId;
      return getId('year');
    }).then(function(yearId) {
      ids.year = yearId;
      return getId('month');
    }).then(function(monthId) {
      ids.month = monthId;
      return getId('date');
    }).done(function(dateId) {
      chrome.bookmarks.create({
        index: 0,
        parentId: '' + dateId,
        title: tab.title,
        url: tab.url
      });
      executeScripts(tab.id, ['alert.js']);
      return console.log('complete');
    });
  };

  chrome.browserAction.onClicked.addListener(function(tab) {
    insertCSSs(tab.id, ['icono.min.css', 'contentscripts.css']);
    return addBookmark(tab);
  });

  chrome.contextMenus.create({
    title: 'とりあえずブックマーク',
    id: 'pageBookmark'
  });

  chrome.contextMenus.create({
    title: 'リンク先をとりあえずブックマーク',
    id: 'linkBookmark',
    contexts: ['link']
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    insertCSSs(tab.id, ['icono.min.css', 'contentscripts.css']);
    switch (info.menuItemId) {
      case 'pageBookmark':
        return addBookmark(tab);
      case 'linkBookmark':
        tabId = tab.id;
        return executeScripts(tab.id, ['exec.js']);
    }
  });

  chrome.runtime.onMessage.addListener(function(cb) {
    var tab;
    if (cb.id === 'linkBookmark') {
      tab = {
        id: tabId,
        url: cb.url,
        title: null
      };
      return getText(tab.url).then(function(txt) {
        return cutTitle(txt);
      }).done(function(title) {
        tab.title = title;
        return addBookmark(tab);
      }, function() {
        return executeScripts(tab.id, ['error.js']);
      });
    }
  });

}).call(this);

//# sourceMappingURL=background.js.map