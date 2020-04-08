'use strict'

const Env           = use('Env')
const moment        = use('moment')
const superagent    = use('superagent')
require('superagent-charset')(superagent)

class IndexController {
  async render ({ request, view, params }) {
    var result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/')
      .buffer(true)
      .send()

    for (var i = 0; i < result.body.length; i++) {
      if (moment().isAfter(result.body[i].extended_custom_fields.extended_content.options.end)) {
        result.body.splice(i, 1)
      }
    }

    return view.render('welcome', {result: result.body})
  }

  async login ({ request, view, params }) {
    var result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    return view.render('login', {result: result.body})
  }
}

module.exports = IndexController
