# 微博图片爬虫

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/wbpic-crawler)

微博图片抓取的基本API

## 使用方法

```typescript
import {
    byUserId, 
    byTopic, 
    bySuperTopic, 
    byNovel, 
    byWeiboId 
} from 'https://x.nest.land/wbpic-crawler@1.0.0/mod.ts'

// 根据用户ID获取微博列表，用户ID是一组数字
let r = await byUserId('12345678')

// r = { list: item[], next:string }

// 翻页使用since_id，每次调用会返回在next字段
let t = await byUserId('12345678', r.next)

/**
 * item = {
 * id: string, // 微博ID
 * text: string  // 文本内容
 * user_id: number  // 用户ID
 * user_name: string  // 用户昵称
 * pics: string[]  // 图片列表
 * } */

// 根据话题获取微博列表
let ss = await byTopic('话题名称')

// 话题翻页，使用数字页码翻页
let st = await byTopic('话题', 2)

// ss = { list: item[] }

// 根据超话获取微博列表
let pp = await bySuperTopic('超话名称')

// 超话翻页，需要since_id
let p2 = await bySuperTopic('超话', pp.next)

// pp = { list: item[], next: string }

// 根据新鲜事ID获取微博列表
let qq = await byNovel('id')

// 新鲜事需要block_id，默认会请求一次获取，如果事先已经知道block_id
// 可以直接提供，减少请求次数
// 翻页使用数字页码
let q2 = await byNovel('id', 2, qq.blockid)

// qq = { list: item[], blockid:number }

/** 
 * 除了新鲜事API返回的结果提供了详细的时间字段time
 * 其他列表API都没有提供时间
 * 因为这几个API返回的默认时间字符串都是类似“2小时前”这种直接显示的文本
 * 综合各种情况来说意义不大，所以没有返回时间结果
 * 
 * 对于需要准确时间的场景，可以调用详情方法获取：
 * */

// id是数字字符串
let zz = await byWeiboId('id')

// zz = item
// zz.time = Date
// 对于长文本的微博，如果有显示不全的情况，也可以调用这个API获取完整的text

/**
 * 返回结果的pics字段是图片ID
 * 可以自行拼接，格式如下：
 * https://[cdn].sinaimg.cn/[size]/[id][.jpg]
 * cdn: CDN分发域名，有很多可选，不知道选哪个可以用wx1
 * size: 图片尺寸，large是原图，还有orj360、orj480等很多格式可选，如果是GIF，则只有large会播放
 * id: 图片ID
 * .jpg: 图片扩展名，jpg和gif，gif原图使用jpg扩展名也可以播放，也可以省略扩展名
 * */
```

## MIT License