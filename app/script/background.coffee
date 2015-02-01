now = moment()
rootFoldername = null
tabId = null

ids =
  root: null
  year: null
  month: null
  date: null

titles =
  root: 'とりブ'
  year: '' + now.year()
  month: '' + (now.month() + 1)
  date: '' + now.date()


chrome.runtime.onInstalled.addListener ->
  chrome.storage.local.get 'foldername', (cb) ->
    if not cb.foldername?
      chrome.storage.local.set {foldername: titles.root} , ->

isURL = (str) ->
  re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  re.test str

insertCSSs = (id, files) ->
  for file in files
    chrome.tabs.insertCSS id, {file: "style/#{file}"}, ->

executeScripts = (id, files) ->
  for file in files
    chrome.tabs.executeScript id, {file: "script/#{file}"}, ->

# HTML(text)を取得
getText = (url) ->
  new Promise (resolve, reject) ->
    if isURL url
      xhr = new XMLHttpRequest()
      xhr.open 'GET', url, true

      xhr.onreadystatechange = ->
        if xhr.readyState is 4
          resolve xhr.responseText

      xhr.send()
    else
      reject 123

# HTML(text)から<title>の中身を取り出す
cutTitle = (txt) ->
  new Promise (resolve) ->
    re = /<title>(.*)<\/title>/i
    resolve txt.match(re)[1]

# ルートフォルダ名をストレージから取ってくる
getRootFolderName = ->
  new Promise (resolve) ->
    chrome.storage.local.get 'foldername', (cb) ->
      resolve cb.foldername

# タイプに応じてchrome.bookmarks.createに使うパラメータを返す
makeFolderParams = (folderType) ->
  params =
    index: 0
    parentId: null
    title: null

  switch folderType
    when 'root'
      params.parentId = '1'
      params.title = titles.root
    when 'year'
      params.parentId = '' + ids.root
      params.title = '' + titles.year
    when 'month'
      params.parentId = '' + ids.year
      params.title = '' + titles.month
    when 'date'
      params.parentId = '' + ids.month
      params.title = '' + titles.date

  # console.log params
  params

createFolder = (folderType) ->
  folderParams = makeFolderParams folderType

  new Promise (resolve) ->
    chrome.bookmarks.create folderParams, (bookmark) ->
      resolve bookmark.id

# nodes中の一番最初にtitleが一致したnodeを返す
filterNodeByTitle = (nodes, title) ->
  eqNode = null

  for node in nodes
    if node.title is title
      eqNode = node
      break

  Promise.resolve eqNode

# 指定フォルダ内のブックマークをすべて取得
getTreeNodes = (parentId) ->
  new Promise (resolve) ->
    chrome.bookmarks.getSubTree parentId, (cb) ->
      resolve cb[0].children

# フォルダ(parentId)内にある、titleフォルダのidを返す
filterTitlesIdByTitle = (parentId, title) ->
  new Promise (resolve, reject) ->
    getTreeNodes parentId
    .then (nodes) ->
      filterNodeByTitle nodes, title
    .done (node) ->
      if node?
        resolve node.id
      else
        reject()

# タイプに応じて、親フォルダのidを返す
getTitlesParentId = (type) ->
  switch type
    when 'root' then '1'
    when 'year' then ids.root
    when 'month' then ids.year
    when 'date' then ids.month

# タイプに応じて、それ自身のidを返す
getId =  (folderType) ->
  id = getTitlesParentId folderType

  new Promise (resolve) ->
    filterTitlesIdByTitle id, titles[folderType]
    .catch ->
      createFolder folderType
    .done (id) ->
      resolve id

# 日付に応じて、ブックマークを保存する
# (e.g.) 2015/01/01 なら [2015]>[1]>[1] へ保存
# 結果として、画面にアラートを表示させる
addBookmark = (tab) ->
  getRootFolderName()

  .then (name) ->
    titles.root = name
    getId 'root'

  .then (rootId) ->
    ids.root = rootId
    getId 'year'

  .then (yearId) ->
    ids.year = yearId
    getId 'month'

  .then (monthId) ->
    ids.month = monthId
    getId 'date'

  .done (dateId) ->
    chrome.bookmarks.create
      index: 0
      parentId: '' + dateId
      title: tab.title
      url: tab.url

    executeScripts tab.id, ['alert.js']
    console.log 'complete'

chrome.browserAction.onClicked.addListener (tab) ->
  insertCSSs tab.id, ['icono.min.css', 'contentscripts.css']
  addBookmark tab

chrome.contextMenus.create
  title: 'とりあえずブックマーク'
  id: 'pageBookmark'

chrome.contextMenus.create
  title: 'リンク先をとりあえずブックマーク'
  id: 'linkBookmark'
  contexts: ['link']

chrome.contextMenus.onClicked.addListener (info, tab) ->
  insertCSSs tab.id, ['icono.min.css', 'contentscripts.css']
  switch info.menuItemId
    when 'pageBookmark'
      addBookmark tab
    when 'linkBookmark'
      tabId = tab.id
      executeScripts tab.id, ['exec.js']

chrome.runtime.onMessage.addListener (cb) ->
  if cb.id is 'linkBookmark'
    tab =
      id: tabId
      url: cb.url
      title: null

    getText tab.url
    .then (txt) ->
      cutTitle txt
    .done (title) ->
      tab.title = title
      addBookmark tab
    , ->
      executeScripts tab.id, ['error.js']
