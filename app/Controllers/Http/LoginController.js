'use strict'
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')

class LoginController {
  async store ({ request, view, response, session }) {
    const data = {
      "id":       request.input('id'),
      "username": request.input('username') || '',
      "password": request.input('password') || ''
    }

    await superagent
      .post('http://localhost:8888/exam/wp-json/jwt-auth/v1/token')
      .type('application/json')
      .send(data)
      .then(users => {
        Redis.set('users', JSON.stringify(users.body))
        response.redirect('paper?id=' + data.id)
      })
      .catch(error => {
        const text = JSON.parse(error.response.text)

        session.flash({
          type: 'red',
          header: text.message,
          message: JSON.stringify(text.data.status)
        })

        response.redirect('back')
      })
  }

  async render ({ request, view, params }) {
    var result = await superagent.get('http://localhost:8888/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    return view.render('login', {
      result: result.body
    })
  }
}

module.exports = LoginController
