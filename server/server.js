const express = require('express')
require('../db/index')
const movieSchema = require('../schema/movieSchema')
const app = express()


// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', '../views');

app.get('/', async (req, res) => {

    const movies = await movieSchema.find({},{_id:0})
    res.render('index.ejs', { movies });

})


app.listen(3000, (err) => {
    if (!err) console.log('服务器启动成功了~http://localhost:3000/')
    else console.log(err)
})

