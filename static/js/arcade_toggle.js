// Arcade style toggler for JS Games
function toggleArcadeStyleSwitch() {
  const arcadeCss = document.getElementById('arcade-style-css');
  const body = document.body;
  const switchEl = document.getElementById('arcade-style-switch');
  if (switchEl.checked) {
    arcadeCss.disabled = false;
    body.classList.add('arcade-style');
    localStorage.setItem('arcadeStyle', 'on');
  } else {
    arcadeCss.disabled = true;
    body.classList.remove('arcade-style');
    localStorage.setItem('arcadeStyle', 'off');
  }
}
// On load, check localStorage and set switch state
window.addEventListener('DOMContentLoaded', function() {
  const arcadeCss = document.getElementById('arcade-style-css');
  const body = document.body;
  const switchEl = document.getElementById('arcade-style-switch');
  if (localStorage.getItem('arcadeStyle') === 'on') {
    arcadeCss.disabled = false;
    body.classList.add('arcade-style');
    if (switchEl) switchEl.checked = true;
  } else {
    arcadeCss.disabled = true;
    body.classList.remove('arcade-style');
    if (switchEl) switchEl.checked = false;
  }
});
