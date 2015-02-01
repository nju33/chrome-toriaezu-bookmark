exec = ->
  cb =
    id: 'linkBookmark'
    url: null

  getHref = (el) ->
    if el.dataset.href? then el.dataset.href else el.href

  activeEl = document.activeElement
  cb.url = getHref activeEl

  chrome.runtime.sendMessage cb, ->

exec()
