'use strict'

const Env           = use('Env')
const Database      = use('Database')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')
const Excel         = use('exceljs')
const Helpers       = use('Helpers')

class PaperController {
  async get_user_meta (user_id, meta_key) {
    const result = await Database
      .table('ex_usermeta')
      .select('*')
      .where({
        user_id,
        meta_key
      })

    return result[0] ? result[0].meta_value : ''
  }

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

    const users = JSON.parse(await Redis.get('users'))

    await Database
      .table('ex_paper')
      .insert({
        posts_id: request.input('id'),
        user_id: users.id,
        paper_title: result.body.title.rendered,
        achievement,
        created_time: new Date().toLocaleString()
      })

    return view.render('result', {
      result: result.body,
      achievement,
      users,
      grid
    })
  }

  async download ({ request, view, response, session, params }) {
    const workbook = new Excel.Workbook()
    workbook.creator = 'test'
    workbook.lastModifiedBy = 'test'
    workbook.created = new Date()
    workbook.modified = new Date()

    let sheet = workbook.addWorksheet('成绩单')

    // Add column headers and define column keys and widths
    sheet.columns = [{
        header: '姓名',
        key: 'username',
        width: 15
      },
      {
        header: '邮箱',
        key: 'email',
        width: 15
      },
      {
        header: '手机号',
        key: 'phone',
        width: 15
      },
      {
        header: '地址',
        key: 'address',
        width: 15
      },
      {
        header: '身份证号',
        key: 'number',
        width: 15
      },
      {
        header: '性别',
        key: 'gender',
        width: 15
      },
      {
        header: '考试',
        key: 'paper_title',
        width: 30
      },
      {
        header: '成绩',
        key: 'achievement',
        width: 15
      },
      {
        header: '考试时间',
        key: 'created_time',
        width: 15
      }
    ]

    const users = JSON.parse(await Redis.get('users'))
    const paper = await Database.from('ex_paper').where({
      posts_id: params.id,
      user_id: users.id
    }).first()

    const data = [{
      username: users.user_nicename,
      email: users.user_email,
      phone: users.info.phone,
      address: users.info.address,
      number: users.info.number,
      gender: users.info.gender === '1' ? '男' : users.info.gender === '0' ? '女' : '',
      paper_title: paper.paper_title,
      achievement: paper.achievement,
      created_time: paper.created_time
    }]
    // Add an array of rows
    sheet.addRows(data)

    await workbook.xlsx.writeFile(`${ Helpers.publicPath('uploads') }/${ paper.paper_title }.xlsx`).then()
    return response.attachment(`${ Helpers.publicPath('uploads') }/${ paper.paper_title }.xlsx`)
  }

  async all ({ request, view, response, session, params }) {
    const users = JSON.parse(await Redis.get('users'))
    if(users.user_caps.administrator) {
      const workbook = new Excel.Workbook()
      workbook.creator = 'test'
      workbook.lastModifiedBy = 'test'
      workbook.created = new Date()
      workbook.modified = new Date()

      let sheet = workbook.addWorksheet('成绩单')

      // Add column headers and define column keys and widths
      sheet.columns = [{
          header: '姓名',
          key: 'username',
          width: 15
        },
        {
          header: '邮箱',
          key: 'email',
          width: 15
        },
        {
          header: '手机号',
          key: 'phone',
          width: 15
        },
        {
          header: '地址',
          key: 'address',
          width: 15
        },
        {
          header: '身份证号',
          key: 'number',
          width: 15
        },
        {
          header: '性别',
          key: 'gender',
          width: 15
        },
        {
          header: '考试',
          key: 'paper_title',
          width: 30
        },
        {
          header: '成绩',
          key: 'achievement',
          width: 15
        },
        {
          header: '考试时间',
          key: 'created_time',
          width: 15
        }
      ]

      var papers = []
      var paper = await Database.raw("SELECT DISTINCT(P.user_id), user_nicename, user_email, paper_title, achievement, created_time FROM ex_paper AS P INNER JOIN ex_users AS U ON (P.user_id = U.id) where posts_id = ?", params.id)
      for (var i = 0; i < paper[0].length; i++) {
        papers.push({
          username: paper[0][i].user_nicename,
          email: paper[0][i].user_email,
          phone: await this.get_user_meta(paper[0][i].user_id, 'info_phone'),
          address: await this.get_user_meta(paper[0][i].user_id, 'info_address'),
          number: await this.get_user_meta(paper[0][i].user_id, 'info_number'),
          gender: await this.get_user_meta(paper[0][i].user_id, 'info_gender') === '1' ? '男' : await this.get_user_meta(paper[0][i].user_id, 'info_gender') === '0' ? '女' : '',
          paper_title: paper[0][i].paper_title,
          achievement: paper[0][i].achievement,
          created_time: paper[0][i].created_time
        })
      }
      // Add an array of rows
      sheet.addRows(papers)

      await workbook.xlsx.writeFile(`${ Helpers.publicPath('uploads') }/${ paper[0][0].paper_title }.xlsx`).then()
      return response.attachment(`${ Helpers.publicPath('uploads') }/${ paper[0][0].paper_title }.xlsx`)
    } else {
      session.flash({
        type: 'red',
        header: 'error',
        message: '无权限'
      })

      response.redirect('back')
    }
  }

  async render ({ request, view, params }) {
    const result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    const users = JSON.parse(await Redis.get('users'))
    const paper = await Database.from('ex_paper').where({
      user_id: users.id,
      posts_id: result.body.id
    })

    return view.render('paper', {
      result: result.body,
      paper: paper.length,
      users
    })
  }
}

module.exports = PaperController
