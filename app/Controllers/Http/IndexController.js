'use strict'
const superagent    = use('superagent')
require('superagent-charset')(superagent)
let result = null

class IndexController {
  async render ({ request, view, params }) {
    result = await superagent.get('https://travelin-tute.ferer.net/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    return view.render('welcome', {result: result.body})
  }
}

module.exports = IndexController
