alert = ->
  doc = document
  classNames = [
    'toriaezu-bookmark-extension-error'
    'toriaezu-bookmark-extension-animate'
  ]

  window.toriaezuBookmarkTimeoutId = null

  alertEl = null
  alertEl = doc.getElementById 'toriaezu-bookmark-extension-error'

  if alertEl?
    alertEl.className = classNames[0]
  else
    alertEl = doc.createElement 'div'
    alertEl.id = 'toriaezu-bookmark-extension-error'
    alertEl.className = classNames[0]
    doc.body.appendChild alertEl
    alertEl.innerHTML = [
      '<p class="toriaezu-bookmark-extension-p">'
      '<span class="icono-cross"></span>'
      'ブックマークできません</p>'
      ].join ''

  setTimeout ->
    alertEl.className = classNames.join ' '
  , 80

alert()
