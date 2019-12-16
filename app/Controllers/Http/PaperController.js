'use strict'

const superagent    = use('superagent')
require('superagent-charset')(superagent)

class PaperController {
  async store ({ request, view, response, session }) {
    console.log(request.input('IDNumber'))
    console.log(request.input('password'))
  }

  async render ({ request, view, params }) {
    const result = await superagent.get('https://travelin-tute.ferer.net/wp-json/wp/v2/paper/' + params.id)
      .buffer(true)
      .send()

    return view.render('paper', {result: result.body})
  }
}

module.exports = PaperController
