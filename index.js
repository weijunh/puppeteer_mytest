
require('./db/index')
const movieSchema = require('./schema/movieSchema')

const puppeteer = require('puppeteer');

// 1. 打开浏览器

// 2. 打开tab页面
// 3. 输入url网址
// 4. 等待页面加载完成，爬取数据
// 5. 保存数据到数据库中
// 6. 关闭浏览器

/*
(async () => {
    const browser = await puppeteer.launch(
        {
            headless: false
        }
    )
    const page = await browser.newPage()
    await page.goto('https://movie.douban.com/cinema/nowplaying/shenzhen/');

    const result = await page.evaluate(() => {
        const result = [];
        // 对页面进行操作
        $('#nowplaying .lists>li').each(function (index, item) {
            const $item = $(item);
            result.push({
                a: $item.find('.poster a').attr('href'),
                img: $item.find('.poster img').attr('src'),
                title: $item.find('.stitle a').text().trim(),
                rating: $item.find('.subject-rate').text().trim(),
            })
        });

        return result;
    });

    // 5. 保存数据到数据库中
    console.log(result);
    // 6. 关闭浏览器
    await browser.close();

})()*/


(async () => {
    // 1. 打开浏览器
    const browser = await puppeteer.launch({
        headless: false  // 有页面
    });
    // 2. 打开tab页面
    const page = await browser.newPage();
    // 3. 输入url网址
    await page.goto('https://movie.douban.com/cinema/nowplaying/shenzhen/');
    // 4. 等待页面加载完成，爬取数据
    const result = await page.evaluate(() => {
        const result = [];
        // 对页面进行操作
        $('#nowplaying .lists>li').each(function (index, item) {
            const $item = $(item);
            result.push({
                a: $item.find('.poster a').attr('href'),
                img: $item.find('.poster img').attr('src'),
                title: $item.find('.stitle a').text().trim(),
                rating: $item.find('.subject-rate').text().trim(),
            })
        });

        return result;
    });

// 继续爬取数据
    for (let i = 0; i < result.length; i++) {
        const item = result[i];
        // 跳转网址
        await page.goto(item.a, {
            waitUntil: 'networkidle2'  //只有2个网络连接时触发
        });
        // 爬取数据
        const detail = await page.evaluate(() => {
            const director = $('#info .attrs a')[0].innerText;
            const summary = $('[property="v:summary"]').text().trim().replace(/\s/g,'');
            return {
                director,
                summary
            }
        });

        Object.assign(item, detail);
    }

    // 5. 保存数据到数据库中
    // console.log(result);
    console.log('开始写入数据库');
    for(let movieItem of result){

        console.log(movieItem);

        let oldMovie = await movieSchema.findOne({title: movieItem.title}, { title: 1})
        if(!oldMovie){
            movieSchema.create({
                movieLink: movieItem.a,
                imgLink: movieItem.img,
                title: movieItem.title,
                rating: movieItem.rating,
                director: movieItem.director,
                summary: movieItem.summary
            })
            console.log(movieItem + '写入成功');
            continue
        }
    }


    // 6. 关闭浏览器
    await browser.close();
    console.log('浏览器关闭')
})();