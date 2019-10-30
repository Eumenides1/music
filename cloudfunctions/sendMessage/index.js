// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID} = cloud.getWXContext()
  const result = await cloud.openapi.templateMessage.send({
    touser:OPENID,
    page:`/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data:{
      keyword1:{
        value:'评价完成'
      },
      keyword2:{
        value:event.content
      }
    },
    templateId:'55WBVLduw3tPbts0jMckGp9em7vGRsO5HX7KPkat4kw',
    formId:event.formId
  })
  return result
}