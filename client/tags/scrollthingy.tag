<scrollthingy>
  <div class="scrollthingy__content">
    <yield />
  </div>
  <nav class="böttns">
    <li each={ chapters } class="böttns__item">
      <a
        href="#/{window.translation.lang}/{get('url')}"
        class={ böttns__link: true, böttns__link--active: active === get('url') }
        alt={ get('title') }
      ></a>
    </li>
  </nav>
<script>

const h = require('../js/lib/scrollthingyHelpers.js')
const domH = require('../js/lib/domHelpers.js')
const Immutable = require('immutable')

if (window.has3d === undefined) window.has3d = domH.has3d()
window.isiPad = window.navigator.userAgent.indexOf('iPad') > -1

/**
 * Trigger a 'scrollstop' event when a scroll event doesn't
 * occure within 100 ms of the last. (triggers update & rerender)
 */
domH.addScrollStopEvent(window)

/**
 * The mount event triggers twice. Cause the element is nestet
 * inside another riot tag. Not a fan of riot anymore (that's not
 * my only issue with it).
 */
window.mounted = window.mounted || false
this.on('mount', () => {
  if (mounted) return
  mounted = true

  if (!window.has3d) {
    window.alert('Please use a modern browser to properly view this page.')
  }

  /* Later used to scroll to the position of that slide */
  const initialHash = domH.getHashFrag(1)
  domH.setHashFrag(1, '')

  /**
   * The initial state of the model
   */
  const model = Immutable.Map({
    scrollY: 0,
    windowH: window.innerHeight,
    hash: domH.getHashFrag(1),
    height: this.root.clientHeight,
    root: this.root,
    factor: window.innerHeight / 100,
    chapter: undefined,
  })

  /**
   * Update the model values to the DOM
   * @arg {Object} model A model as defined above
   * @returns {Object} The new Model
   */
  const update = (model) => {
    const newModel = model
      .update('chapters', h.updateChapterMaps.bind(null, model))
    return (
      newModel
        .set('scrollY', window.scrollY || window.pageYOffset)
        .set('windowH', window.innerHeight)
        .set('hash', domH.getHashFrag(1))
        .set( 'height', h.calcHeightSum(model.get('chapters')) )
        .set('factor', window.innerHeight / 100)
        .set('chapter', h.getCurrentChapter(newModel))
        .set('width', window.innerWidth)
    )
  }

  /**
   * Renders the changes in the model using a diffing mechanism
   * @param {Object} model A model
   * @returns {Object} model The same model that was passed
   */
  const render = h.updater({
    /**
     * Whenever the hash changes, update it in the DOM.
     * Also, if the new hashfrag isn't equal to the url prop
     * of the current chapter, a manual hashchange must have
     * occured. Meaning, we'll need to scroll to the new chapter.
     */
    hash: (hash, model) => {
      domH.setHashFrag(1, hash)
      if ((model.get('chapter') || Immutable.Map()).get('url') !== hash) {
        const chapter = h.getChapterByUrl(hash, model)
        if (!chapter) return
        window.scrollTo(0, chapter.get('topPx'))
      }
    },
    chapters: h.lazyArrayUpdater({
      /**
       * To prevent frame skipping and generally shitty performance,
       * the diffs in the position attributes are applied sequentially.
       * `slowAnimation` simply triggers a function in the next
       * animationframe.
       */
      position: (pos, el) => {
        el.get('element').style.position = pos
      },
      height: (h, el) => {
        el.get('parent').style.height = `${h}px`
      }
    }),
    height: (height, model) => { model.get('root').style.height = height + 'px' },
    chapter: h.updater({
      url: (url) => {
        this.update({ active: url })
        domH.setHashFrag(1, url)
      }
    }, Immutable.Map()),
  }, Immutable.Map())

  /*
   * Initialize the sections
   */
  ; ((initModel) => {
    let model = initModel
      .set('chapters', h.getChapters(initModel))
      .update('chapters', h.initializeSectionStyles)
    const exec = () => { model = render(update(model)) }

    /**
     * Update and render the scrollthingy at all relevant events.
     */
    exec()
    window.addEventListener('scroll', domH.throttleAnimation(exec))
    window.addEventListener('resize', domH.throttleAnimation(exec))
    window.addEventListener('load', exec)
    window.addEventListener('hashchange', exec)

    /**
     * A custom event added using `domH.addScrollStopEvent`
     * Without this eventlistener, the elements stop scrolling
     * too early sometimes.
     */
    window.addEventListener('scrollstop', exec)

    /**
     * The translation riot tag triggers a `translated` event
     * when all elements have been translated.
     */
    let initialTranslation = true
    window.addEventListener('translated', () => {
      /**
       * Before the elements are translated, their height is
       * incorrect. So the chapter maps have to be updated,
       * in order for the elements to be positioned correctly.
       */
      model = model.update(
        'chapters',
        h.updateChapterMaps.bind(null, model, true)
      )

      /**
       * After the initial translation loads, set the hashFrag to
       * it's initial state. That way another hashchange happens and
       * The renderer scrolls to the right slide.
       */
      if (initialTranslation) {
        domH.setHashFrag(1, initialHash)
        initialTranslation = false
      }

      exec()

      model = h.updateChapterTitles(model)
      const chapters = model.get('chapters').toArray()
      this.update({ chapters: chapters.slice(0, chapters.length - 1) })
    })
  })(model)
})

</script>
<style scoped>
:scope {
  position: relative;
  z-index: 1;
  display: block;
  overflow: hidden;
}

:scope .scrollthingy__content {
  z-index: 1;
  display: block;
  height: 100%;
  overflow: hidden;
  position: relative;
}

:scope .scrollthingy__sectionWrapper {
  position: relative;
  width: 100%;
  display: block;
}

:scope .scrollthingy__section {
  position: relative;
  top: 0;
  left: 0;
  min-height: 100vh;
  min-width: 100%;
  background-color: white;
}

:scope .böttns {
  z-index: 1;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:scope .böttns__link {
  display: block;
  width: 1rem;
  height: 1rem;
  background-color: hsla(0, 0%, 0%, .6);
  border-radius: 1rem;
  margin: .3rem;
  border: solid 3px hsl(0, 0%, 100%);
  transform: scale(1);
  transition: .4s transform, .4s border-color, .4s background-color;
}

:scope .böttns__link--active {
  background-color: hsla(0, 0%, 100%, .6);
  border-color: hsla(0, 0%, 0%, .6);
  transform: scale(1.2);
}

:scope .böttns {
  list-style: none;
}

:scope .scrollthingy__section:nth-last-child(2) {
  box-shadow: 0 -14px 30px 14px black;
}

:scope .scrollthingy__sectionWrapper:nth-last-child(1) .scrollthingy__section {
  min-height: 10vh;
  top: auto;
  bottom: 0;
  color: #000;
  width: 100%;
  text-align: center;
  line-height: 2rem;
}

:scope .scrollthingy__sectionWrapper:nth-last-child(1) a {
  color: blue;
}

</style>
</scrollthingy>

