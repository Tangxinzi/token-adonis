'use strict'
const superagent    = use('superagent')
require('superagent-charset')(superagent)

class LoginController {
  async store ({ request, view, response, session }) {
    return response.redirect('/paper/' + request.input('id'))
  }

  async render ({ request, view, params }) {
    var result = await superagent.get('http://localhost:8888/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    return view.render('login', {result: result.body})
  }
}

module.exports = LoginController
