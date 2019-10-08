/**
 ├── modules
 └── UserModel.js
 */
const db = require('../config/db');
// 引入Sequelize对象
const Sequelize = db.sequelize;

const User = Sequelize.import('../schema/z_user');

class UserModel {
    /**
     * 创建用户模型
     * @param data
     * @returns {Promise<<Model<T, T2>>>}
     */
    static async createUser(data) {
        return User.create({
            nickname: data.nickname,
            realname: data.realname,
            password: data.password,
            avatar: data.avatar,
            sex: data.sex,
            birthday: data.birthday,
            create_time: parseInt((new Date().getTime() / 1000).toString()),
            update_time: parseInt((new Date().getTime() / 1000).toString())
        })
    }

    /**
     * 查询取用户信息
     * @param id  文章ID
     * @returns {Promise<<Model<T, T2> | null>>}
     */
    static async getUserInfo(id) {
        return User.findOne({
            exclude: ['realname', 'password'],
            where: {id}
        })
    }

    /**
     * 查询用户列表
     * @returns {Promise<<Model[]>>}
     */
    static async getUserList() {
        return User.findAll({
            exclude: ['realname', 'password'],
            where: {status: 1},
            limit: 10
        })
    }
}

module.exports = UserModel
