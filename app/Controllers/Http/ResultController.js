'use strict'

const Database     = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)

class ResultController {
  async render ({ request, view, params }) {
    return view.render('result')
  }
}

module.exports = ResultController
