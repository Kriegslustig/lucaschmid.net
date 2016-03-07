<commentform>
<form onsubmit={ submit }>
  <input type="text" name="author" placeholder="Name">
  <textarea name="text" cols="30" rows="5" placeholder="Comment"></textarea>
  <input value="post" type="submit" name="submit">
</form>

<style scoped>
  :scope input,
  :scope textarea {
    font: inherit;
    border: none;
    background: none;
    resize: none;
    width: 100%;
    margin-bottom: 1rem;
  }

  :scope input[type=text] {
    border-bottom: solid 2px hsl(0, 0%, 90%);
    transition: border-bottom .6s;
  }

  :scope input[type=text]:focus {
    border-bottom: solid 2px hsl(0, 0%, 0%);
  }

  :scope input[type=submit] {
    width: auto;
    padding: 0 .5rem;
    line-height: 2.5rem;
    background-color: hsl(0, 0%, 85%);
    transition: background-color .6s;
  }

  :scope input[type=submit]:focus,
  :scope input[type=submit]:hover {
    background-color: hsl(0, 0%, 80%);
  }

  :scope input[type=submit]:hover {
    cursor: pointer;
  }

  :scope textarea {
  }

</style>

<script>
const xhr = require('../js/lib/xhr')
submit (e) {
  const data = Array.from(this.root.querySelectorAll('input,textarea'))
    .reduce((mem, el) => {
      if (el.type === 'submit') return mem
      mem[el.name] = el.value
      return mem
    }, {})

  data.post = window.location.href
    .split('/')
    .reverse()[0]

  xhr.post('/api/comments/postComment', data)
    .then(e => console.log(e))
    .catch(e => console.error(e))

  return false
}
</script>
</commentform>
