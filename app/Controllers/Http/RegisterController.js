'use strict'
const superagent    = use('superagent')
require('superagent-charset')(superagent)

class RegisterController {
  async render ({ request, view, params }) {
    return view.render('register')
  }
}

module.exports = RegisterController
