'use strict'

const Env           = use('Env')
const Database      = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')

class ResultController {
  async render ({ request, view, params }) {
    const users = await Redis.get('users')
    return view.render('result', {
      users: JSON.parse(users)
    })
  }
}

module.exports = ResultController
