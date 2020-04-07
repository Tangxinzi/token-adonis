'use strict'

const Database      = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')

class PaperController {
  async store ({ request, view, response, session }) {
    var num = 0, grid = []
    for (var i = 0; i < request.input('length'); i++) {
      const s = request.input('subject-' + i)
      const t = request.input('true-' + i)
      // console.log('用户选择：' + s + '\t正确答案：' + t + '\t' + (s == t ? '正确' : '错误'))

      grid.push({
        subject: s,
        true: t,
        res: s == t ? true : false
      })

      if (s == t) {
        num ++
      }
    }

    const result = await superagent.get('http://localhost:8888/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    const achievement = 100 / request.input('length') * num
    // console.log('您的成绩为：' + achievement)

    const users = await Redis.get('users')
    return view.render('result', {
      result: result.body,
      users: JSON.parse(users),
      achievement,
      grid
    })
  }

  async render ({ request, view, params }) {
    const result = await superagent.get('http://localhost:8888/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    const users = await Redis.get('users')
    return view.render('paper', {
      result: result.body,
      users: JSON.parse(users)
    })
  }
}

module.exports = PaperController
