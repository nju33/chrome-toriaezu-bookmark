alert = ->
  doc = document
  classNames = [
    'toriaezu-bookmark-extension-alert'
    'toriaezu-bookmark-extension-animate'
  ]

  window.toriaezuBookmarkTimeoutId = null

  alertEl = null
  alertEl = doc.getElementById 'toriaezu-bookmark-extension-alert'

  if alertEl?
    alertEl.className = classNames[0]
  else
    alertEl = doc.createElement 'div'
    alertEl.id = 'toriaezu-bookmark-extension-alert'
    alertEl.className = classNames[0]
    doc.body.appendChild alertEl
    alertEl.innerHTML = [
      '<p class="toriaezu-bookmark-extension-p">'
      '<span class="icono-check"></span>'
      'ブックマークしました</p>'
      ].join ''

  setTimeout ->
    alertEl.className = classNames.join ' '
  , 80

alert()
