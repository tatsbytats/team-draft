import './style.css'

const ROLES = [
  { id: 'jungle', full: 'Jungle' },
  { id: 'gold', full: 'Gold Laner' },
  { id: 'exp', full: 'EXP Laner' },
  { id: 'mid', full: 'Mid Laner' },
  { id: 'roam', full: 'Roamer' },
]

const NEEDED = 10

const rosterEl = document.getElementById('roster')
const teamsEl = document.getElementById('teamsBody')
const teamsBar = document.getElementById('teamsBar')
const countEl = document.getElementById('count')
const hintEl = document.getElementById('hint')
const drawBtn = document.getElementById('drawBtn')
const clearBtn = document.getElementById('clearBtn')
const copyBtn = document.getElementById('copyBtn')

let draw = null

function shuffle(list) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function names() {
  return rosterEl.value
    .split(/[\n,;]+/)
    .map((name) => name.trim())
    .filter(Boolean)
}

function nameAt(index) {
  return names()[index] || '—'
}

function setHint(text, warn) {
  hintEl.textContent = text
  hintEl.classList.toggle('is-warn', Boolean(warn))
}

function onInput() {
  const values = names()
  const seen = new Set()
  const dups = new Set()

  values.forEach((value) => {
    if (seen.has(value)) dups.add(value)
    seen.add(value)
  })

  countEl.textContent = `${values.length}/${NEEDED}`
  drawBtn.disabled = values.length !== NEEDED || dups.size > 0

  if (dups.size > 0) {
    setHint('Two names are the same — make them unique.', true)
  } else if (values.length < NEEDED) {
    setHint(`Add ${NEEDED - values.length} more name${
      NEEDED - values.length === 1 ? '' : 's'
    }.`)
  } else if (values.length > NEEDED) {
    setHint(`That's ${values.length} names — ${NEEDED} are needed.`, true)
  } else if (draw) {
    setHint('Drawn. Press Draw teams again to reroll.')
  } else {
    setHint('Ready. Press Draw teams.')
  }

  if (draw) renderResult(false)
}

function drawTeams() {
  const pool = shuffle(names().map((name, index) => index))
  const deal = (side, players) =>
    shuffle(ROLES).forEach((role, i) => {
      draw[side][role.id] = players[i]
    })

  draw = { blue: {}, red: {} }
  deal('blue', pool.slice(0, 5))
  deal('red', pool.slice(5, 10))

  renderResult(true)
}

function panel(title, side, assignment) {
  const block = document.createElement('div')
  block.className = `team team--${side}`

  const head = document.createElement('div')
  head.className = 'team__head'
  head.innerHTML = `<h3>${title}</h3>`

  const list = document.createElement('div')
  list.className = 'team__list'
  ROLES.forEach((role, i) => {
    const row = document.createElement('div')
    row.className = 'row'
    row.style.setProperty('--i', i)
    row.innerHTML =
      `<span class="row__role">${role.full}</span>` +
      `<span class="row__name">${nameAt(assignment[role.id])}</span>`
    list.append(row)
  })

  block.append(head, list)
  return block
}

function renderResult(animate) {
  teamsBar.hidden = false
  teamsEl.innerHTML = ''

  const split = document.createElement('div')
  split.className = 'split'
  split.append(
    panel('Team A', 'blue', draw.blue),
    Object.assign(document.createElement('span'), { className: 'vs', textContent: 'VS' }),
    panel('Team B', 'red', draw.red)
  )
  teamsEl.append(split)

  if (animate) {
    teamsEl.classList.remove('is-drawn')
    void teamsEl.offsetWidth
    teamsEl.classList.add('is-drawn')
    setHint('Drawn. Press Draw teams again to reroll.')
  }
}

function resultText() {
  if (!draw) return ''
  const lines = []
  ;[
    ['Team A', draw.blue],
    ['Team B', draw.red],
  ].forEach(([title, assignment]) => {
    lines.push(title)
    ROLES.forEach((role) => {
      lines.push(`${role.full} — ${nameAt(assignment[role.id])}`)
    })
    lines.push('')
  })
  return lines.join('\n').trim()
}

async function copyResults() {
  const text = resultText()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copyBtn.textContent = 'Copied'
  } catch {
    copyBtn.textContent = 'Copy failed'
  }
  setTimeout(() => {
    copyBtn.textContent = 'Copy results'
  }, 1800)
}

function clearAll() {
  rosterEl.value = ''
  draw = null
  teamsBar.hidden = true
  teamsEl.classList.remove('is-drawn')
  teamsEl.innerHTML =
    '<p class="empty">Nothing drawn yet. Add ten names and press Draw teams.</p>'
  onInput()
}

rosterEl.addEventListener('input', onInput)
drawBtn.addEventListener('click', drawTeams)
clearBtn.addEventListener('click', clearAll)
copyBtn.addEventListener('click', copyResults)
onInput()
