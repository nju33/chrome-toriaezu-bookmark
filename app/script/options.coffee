doc = document

foldername = null
foldernameEl = doc.getElementById 'foldername'
saveEl = doc.getElementById "save"

save = ->
  tgt = null

  chrome.bookmarks.getSubTree '1', (cb) ->
    nodes = cb[0].children

    for node in nodes
      tgt = node if node.title is foldername
      break

    if tgt?
      chrome.bookmarks.update tgt.id, {title: foldernameEl.value}, ->

    chrome.storage.local.set {foldername: foldernameEl.value} , ->


chrome.storage.local.get 'foldername', (cb) ->
  foldername =  cb.foldername
  foldernameEl.value =  cb.foldername

saveEl.addEventListener 'click', save, false
