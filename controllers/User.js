/**
 ├── controllers
 └── User.js
 */
const UserModel = require('../model/UserModel')
const moment = require('moment')

class UserController {
    /**
     * 获取用户列表
     * @param ctx
     * @returns {Promise<void>}
     * @constructor
     */
    static async UserList(ctx){
        try {
            // 查询用户列表模型
            let data = await UserModel.getUserList();

            ctx.response.status = 200;
            ctx.body = {
                code: 200,
                msg: '查询成功',
                data
            }

        } catch (err) {
            ctx.response.status = 412;
            ctx.body = {
                code: 412,
                msg: '查询失败',
                err
            }
        }
    }

    /**
     * 获取用户信息
     * @param ctx
     * @returns {Promise<void>}
     * @constructor
     */
    static async UserInfo(ctx){
        let id = ctx.query.id;
        if(id){
            try {
                // 查询用户详情模型
                let data = await UserModel.getUserInfo(id);

                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: '查询成功',
                    data
                }

            } catch (err) {
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: '查询失败',
                    err
                }
            }
        } else {
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: '用户ID必须传'
            }
        }

    }
}

module.exports = UserController;
