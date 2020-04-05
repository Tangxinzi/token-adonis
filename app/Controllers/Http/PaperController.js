'use strict'

const Database     = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
let result = null

class PaperController {
  async store ({ request, view, response, session }) {
    const id = JSON.parse(result.text).id
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

    const achievement = 100 / request.input('length') * num
    // console.log('您的成绩为：' + achievement)
    return view.render('result', {result: JSON.parse(result.text), achievement, grid })
  }

  async render ({ request, view, params }) {
    result = await superagent.get('http://localhost:8888/exam/wp-json/wp/v2/paper/' + params.id)
      .buffer(true)
      .send()

    return view.render('paper', {result: result.body})
  }
}

module.exports = PaperController
