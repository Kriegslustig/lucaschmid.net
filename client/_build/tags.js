riot.tag2('commentform', '<form onsubmit="{submit}"><input type="text" name="author" placeholder="Name"><textarea name="text" cols="30" rows="5" placeholder="Comment"></textarea><input value="post" type="submit" name="submit"></form>', 'commentform input,[riot-tag="commentform"] input,commentform textarea,[riot-tag="commentform"] textarea { font: inherit; border: none; background: none; resize: none; width: 100%; padding: .5rem; margin-bottom: 1rem; background-color: hsl(0, 0%, 94%); transition: background-color .6s; box-shadow: 0 3px 6px hsl(0, 0%, 88%), 0 3px 6px hsl(0, 0%, 76%); } commentform input[type=text],[riot-tag="commentform"] input[type=text] { width: 30%; } commentform input[type=submit],[riot-tag="commentform"] input[type=submit] { width: auto; padding: 0 .5rem; line-height: 2.5rem; transition: background-color .6s; box-shadow: 0 3px 6px hsl(0, 0%, 88%), 0 3px 6px hsl(0, 0%, 76%); } commentform input[type=submit]:hover,[riot-tag="commentform"] input[type=submit]:hover { cursor: pointer; } commentform input:focus,[riot-tag="commentform"] input:focus,commentform textarea:focus,[riot-tag="commentform"] textarea:focus,commentform input:hover,[riot-tag="commentform"] input:hover,commentform textarea:hover,[riot-tag="commentform"] textarea:hover { background-color: hsl(0, 0%, 85%); }', '', function(opts) {
const xhr = require('../js/lib/xhr')
const _ = require('lodash')

this.submit = function (e) {
  const data = Array.from(this.root.querySelectorAll('input,textarea'))
    .reduce((mem, el) => {
      if (el.type === 'submit') return mem
      mem[el.name] = el.value
      return mem
    }, {})

  data.post = window.location.href
    .split('/')
    .reverse()[0]

  if (!comments) return console.error('The comments section isn\'t beeing shown so I\'m not posting your comment')
  const comment = _.clone(data)
  const commentsOnServer = _.cloneDeep(comments.comments)
  comment.state = 'sending'
  comments.update({
    comments: comments.comments.concat(comment)
  })

  xhr.post('/api/comments/postComment', data)
    .then(e => {
      comment.state = 'sent'
      comments.update({
        comments: commentsOnServer.concat(comment)
      })
    })
    .catch(e => {
      console.log(e)
      comment.state = 'failed'
      comments.update({
        comments: commentsOnServer.concat(comment)
      })
      setTimeout(() => {
        comments.update({
          comments: commentsOnServer
        })
      }, 2000)
    })

  return false
}.bind(this)
}, '{ }');


riot.tag2('comments', '<h2>Comments</h2><ul><li each="{comments}" class="{state}"><blockquote><h4 class="author">{author}</h4><p class="text">{text}</p></blockquote></li></ul>', 'comments,[riot-tag="comments"] { display: block; margin-bottom: 4rem; } comments::before,[riot-tag="comments"]::before { content: \'\'; display: block; height: 1px; width: 100%; margin: 1rem 0 0 0; background-color: #DDD; } comments ul,[riot-tag="comments"] ul { padding: 0; } @keyframes pulse { 0% { opacity: 1; } 100% { opacity: 0; } } comments li,[riot-tag="comments"] li { list-style: none; transition: color .6s; } comments .sending,[riot-tag="comments"] .sending { animation: pulse 1s 0 infinite alternate; color: hsl(50, 0%, 50%); } comments .failed,[riot-tag="comments"] .failed { color: hsl(360, 65%, 50%); } comments .sent,[riot-tag="comments"] .sent { color: hsl(120, 65%, 50%); }', '', function(opts) {
const xhr = require('../js/lib/xhr')
const post = window.location.href
  .split('/')
  .reverse()[0]

window.comments = this

this.on('mount', () => {
  xhr(`/api/comments/getComments/${post}`)
    .then(JSON.parse)
    .then(comments => this.update({ comments }))
    .catch(err => console.error(err))
})
}, '{ }');


riot.tag2('custom-navigation', '<ul><li each="{items}" data-id="{id}" class="{active ? \'active\' : \'\'}"><div class="line"></div><a href="{url}">{name}</a></li></ul>', 'custom-navigation,[riot-tag="custom-navigation"] { position: fixed; top: 10rem; width: 170px; padding: 0 1rem 0 0; } custom-navigation ul,[riot-tag="custom-navigation"] ul { margin-top: 0; } custom-navigation li,[riot-tag="custom-navigation"] li { display: block; position: relative; text-align: right; margin-bottom: .5rem; line-height: 1.2rem; } custom-navigation li a,[riot-tag="custom-navigation"] li a,custom-navigation li a:visited,[riot-tag="custom-navigation"] li a:visited { font-size: .8rem; color: #AAA; transition: color .2s; } custom-navigation li a:hover,[riot-tag="custom-navigation"] li a:hover,custom-navigation li.active a,[riot-tag="custom-navigation"] li.active a { color: #666; } custom-navigation li .line,[riot-tag="custom-navigation"] li .line { content: \'\'; position: absolute; right: -1rem; top: 0; width: 2px; height: 0; background: #CCC; transition: height .2s, background .2s; margin-right: .5rem; } custom-navigation li:hover .line,[riot-tag="custom-navigation"] li:hover .line,custom-navigation li.active .line,[riot-tag="custom-navigation"] li.active .line { background: #666; } custom-navigation ul,[riot-tag="custom-navigation"] ul { height: 80vh; }', '', function(opts) {
    const _ = require('lodash')
    const dom = require('../js/lib/domHelpers')

    const calcPercent = (offset, factor, top) => {
      return Math.round(( offset - top ) / factor)
    }

    const calcPos = () => {
      this.root.style.left = (
          dom.getTopOffset(this.root.parentNode, 'offsetLeft')
          - this.root.clientWidth
      ) + 'px'
    }

    this.items = _.map(document.querySelectorAll('h1'), el => {
      return {
        id: el.id,
        name: el.textContent,
        active: false,
        url: (el.childNodes[0] || {}).href || '#' + el.id,
      }
    })

    this.on('mount', () => {
      calcPos()
      _.each(this.root.getElementsByTagName('li'), (el, i) => {
        const elem = document.getElementById(el.getAttribute('data-id')).parentNode
        const center = innerHeight / 3
        const containerHeight = center > elem.clientHeight
          ? elem.clientHeight
          : elem.clientHeight - innerHeight / 3
        const topOffset = dom.getTopOffset(elem) - center
        const factor = ( containerHeight / 100 )
        const updateBarHeight = _.throttle(e => {
          var res = calcPercent(scrollY, factor, topOffset)
          if(res < 0) res = 0
          if(res > 100) res = 100
          this.items[i].active = !!(res > 0 && res < 100)
          this.update()
          el.children[0].style.height = res + '%'
        }, 30)
        addEventListener('scroll', updateBarHeight)
        updateBarHeight()
      })
    })

    window.addEventListener('resize', calcPos)
}, '{ }');


riot.tag2('example-riot', '<p>{time}</p>', '', '', function(opts) {
    setInterval(() => {
      this.update({time: new Date})
    }, 1000)
}, '{ }');


riot.tag2('gistogram', '<p>I like code.</p><div class="container"><div class="item__container" each="{day in days}"><div class="item"><div class="number">{day.length}</div><div class="commits" each="{day}"><a href="{url}" class="commit">{comment}</a></div></div></div></div><yield></yield>', 'gistogram,[riot-tag="gistogram"] { display: block; width: 100%; height: 100vh; background-color: hsl(240, 30%, 90%); } gistogram > p,[riot-tag="gistogram"] > p { padding: 1rem; } gistogram .container,[riot-tag="gistogram"] .container { padding: 1rem; direction: rtl; height: calc(100vh - 5.6rem); white-space: nowrap; } gistogram .item,[riot-tag="gistogram"] .item { display: block; position: absolute; height: 0; width: 100%; left: 0; bottom: 0; background-color: #fff; transition: height .4s; } gistogram .item__container,[riot-tag="gistogram"] .item__container { display: inline-block; position: relative; width: 2rem; height: 100%; margin: 0 .8rem; } gistogram .number,[riot-tag="gistogram"] .number { position: absolute; top: -3rem; right: 0; height: 2rem; width: 2rem; line-height: 2rem; text-align: center; border: none; border-radius: .25rem; color: #000; background-color: #EEE; transform: scaleY(0) translateY(7rem); transition: transform .2s; } gistogram .item:hover .number,[riot-tag="gistogram"] .item:hover .number { transform: scaleY(1) translateY(0); } gistogram .number:after,[riot-tag="gistogram"] .number:after { content: \'\'; position: absolute; bottom: -.5rem; left: .5rem; height: 1rem; width: 1rem; background-color: #EEE; transform: rotate(45deg); } gistogram .commits,[riot-tag="gistogram"] .commits { position: absolute; opacity: 0; }', '', function(opts) {
    const _ = require('lodash')

    this.days = [
      [
        {
          comment: 'Hi!',
          url: '/'
        },
        {
          comment: 'bye!',
          url: '/'
        },
      ],
      [
        {
          comment: 'Hi!',
          url: '/'
        },
        {
          comment: 'bye!',
          url: '/'
        },
        {
          comment: 'yoo!',
          url: '/'
        }
      ]
    ]

    const updateHeights = () => {
      if(!this.root.children[1]) return
      const highest = _.map(this.days, day => day.length)
        .sort()
        .reverse()[0]
      _.chain(this.root.children[1].querySelectorAll('.item'))
        .map((item, i) => {
          const height = Math.round(this.days[i].length / highest * 100)
          item.style.height = `${height}%`
        })
        .value()
    }

    this.on('mount', () => {
      setTimeout(updateHeights, 0)
    })

    this.on('updated', updateHeights)

}, '{ }');


riot.tag2('work-in-progress', '<div if="{commit && recent}"><p><b>Work in Progress.</b></p><a target="_blank" href="{commit.html_url}">{commit.commit.committer.name}: {commit.commit.message}</a></div>', 'work-in-progress,[riot-tag="work-in-progress"],work-in-progress div,[riot-tag="work-in-progress"] div { display: block; overflow: hidden; min-height: 5rem; background-color: #EEE; } work-in-progress div,[riot-tag="work-in-progress"] div { opacity: 1; width: 100%; padding: 1rem; top: 0; left: 0; transition: opacity .2s; } work-in-progress > a,[riot-tag="work-in-progress"] > a,work-in-progress > p,[riot-tag="work-in-progress"] > p { display: block; width: 100 %; }', '', function(opts) {
    const api = require('../js/lib/api')
    const dom = require('../js/lib/domHelpers')

    var firstCommit = true
    var currentCommit

    const tagOnScreen = () => dom.getTopOffset(this.root) > (window.scrollY - this.root.clientHeight)

    const flash = (el, parent) => {
      el.style.opacity = 0
      parent.style.height = parent.innerHeight + 'px'
      setTimeout(function () {
        el.style.position = 'fixed'
        el.style.opacity = 1
      }, 200)
      setTimeout(function () {
        el.style.opacity = 0
        setTimeout(function () {
          el.style.position = ''
          el.style.opacity = ''
          parent.style.height = ''
        }, 200)
      }, 4000)
    }

    this.on('update', () => {
      this.update({
        recent: (
          !this.commit
            ? false
            : (new Date).getTime() - (new Date(this.commit.commit.committer.date)).getTime()
              < (86400 * 2 * 1000)
        )
      })
      if (this.commit) {
        if (firstCommit) {
          firstCommit = false
        } else if(!tagOnScreen() && currentCommit !== this.commit.sha) {
          flash(this.root.children[0], this.root)
        }
        currentCommit = this.commit.sha
      }
    })

    api('github', 'lastCommit')
      .then(commit => this.update({ commit }))
      .catch(err => { throw err })

}, '{ }');


