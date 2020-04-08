<h1 align="center">网络考试平台</h1>

该应用前端主要展示以下功能
----

- 形成若干套试题套卷
- ￼学生答题并提交试卷
- ￼试卷提交后即打印相应分数，下载 Excel 表格
- ￼管理员下载学生信息及考试成绩
- ￼注册学生账号

![网络考试平台](./public/images/overview/index.png)
![登录考试平台](./public/images/overview/login.png)
![考试平台](./public/images/overview/paper.png)

后端
---

- ￼管理员管理考试用卷套数
- 管理员添加考生参与指定的考试，已被指定参与考试的学生方能进入考试
- ￼后台可以对账号进行管理

项目下载和运行
---

拉取项目代码
```
git clone https://github.com/Tangxinzi/token-adonis.git
cd token-adonis
```

安装依赖
```
yarn install
```

开发模式运行
```
cp .env.example .env
adonis key:generate
adonis serve --dev
```

如果提示没有找到 `adonis` 命令，您需要先去安装一下。
```
npm install @adonisjs/cli --global
```
