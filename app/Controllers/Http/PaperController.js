'use strict'

const Env           = use('Env')
const Database      = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')
const Excel         = use('exceljs')
const Helpers       = use('Helpers')

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

    const result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + request.input('id'))
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

  async download ({ response, request, view, params }) {
    const workbook = new Excel.Workbook()
    workbook.creator = 'test'
    workbook.lastModifiedBy = 'test'
    workbook.created = new Date()
    workbook.modified = new Date()

    let sheet = workbook.addWorksheet('test 表格')

    // Add column headers and define column keys and widths
    sheet.columns = [{
        header: '创建日期',
        key: 'create_time',
        width: 15
      },
      {
        header: '单号',
        key: 'id',
        width: 15
      },
      {
        header: '电话号码',
        key: 'phone',
        width: 15
      },
      {
        header: '地址',
        key: 'address',
        width: 15
      }
    ]
    const data = [{
      create_time: '2018-10-01',
      id: '787818992109210',
      phone: '11111111111',
      address: '深圳市'
    }]
    // Add an array of rows
    sheet.addRows(data)

    await workbook.xlsx.writeFile(`${ Helpers.publicPath('uploads') }/test.xlsx`).then()
    return response.attachment(`${ Helpers.publicPath('uploads') }/test.xlsx`)
  }

  async render ({ request, view, params }) {
    const result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + request.input('id'))
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
