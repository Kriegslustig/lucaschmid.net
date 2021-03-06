<translation-switcher>
  <!-- This is simply implemented as cheaply as possible -->
  <nav class="langnav">
    <li each={ langs } class="langnav__item">
      <button
        onclick={ changelang }
        class={
          langnav__switch: true,
          'langnav__switch--active': this.parent.lang === lang
        }
      >{ lang }</button>
    </li>
  </nav>
  <yield />
<script>

window.translation = this

const domH = require('../js/lib/domHelpers.js')
require('../js/lib/CustomEvent.js')()

const setLang = (lang) =>
  domH.setHashFrag(0, lang)
const getLang = () => domH.getHashFrag(0)

this.changelang = (e) => this.update({ lang: e.target.innerText })

const triggerEvent = () => {
  window.dispatchEvent(
    new window.CustomEvent(
      'translated',
      { detail: { language: this.lang } }
    )
  )
}

const show = (el) => {
  setTimeout(() => {
    el.style.display = 'block'
    setTimeout(() => {
      el.classList.add('translation--show')
    }, 30)
  }, 800)
}

const hide = (el) => {
  el.classList.remove('translation--show')
  setTimeout(() => {
    el.style.display = 'none'
  }, 800)
}

this.on('mount', () => {
  this.on('updated', () => {
    setLang(this.lang)
    ; [].slice.call(this.root.querySelectorAll('[data-lang]'))
      .forEach((el) => {
        el.getAttribute('data-lang') === this.lang
          ? show(el, this.lang)
          : hide(el)
      })
    document.documentElement.setAttribute('lang', this.lang)
    window.setTimeout(triggerEvent, 900)
  })
  this.update({
    langs: this.opts.dataLanguages
      .substring(1, this.opts.dataLanguages.length - 1)
      .split(',')
      .map( (lang) => ({ lang: lang.substring(1, lang.length - 1) }) )
  })
  this.update({ lang: getLang() || this.langs[1].lang })
  setTimeout(() => this.update({ lang: this.lang }), 600) // To make sure the translations have been rendered
})

</script>
<style scoped>

:scope .langnav {
  position: fixed;
  top: 1rem;
  right: 1rem;
  list-style: none;
  z-index: 2;
  padding: .5rem 0.7rem;
  background-color: hsla(0, 0%, 0%, 0.3) !important;
}

:scope .langnav,
:scope .langnav__switch {
  color: #fff;
  text-shadow: 1px 1px black;
}

:scope .langnav__item {
  display: inline;
}

:scope .langnav__item::after {
  content: '/';
}

:scope .langnav__item:last-child::after {
  display: none;
}

:scope .langnav__switch {
  margin: 0 -6px;
  padding: 0;
  background-color: transparent;
  border: none;
  font: inherit;
}

:scope .langnav__switch--active,
:scope .langnav__switch:hover {
  cursor: pointer;
  text-decoration: underline;
}

[data-lang] {
  display: none;
  opacity: 0;
  transform: translateY(10vh);
  transition: opacity .8s, transform .8s;
}

:scope .translation--show {
  opacity: 1;
  transform: translateY(0);
}

</style>
</translation-switcher>

