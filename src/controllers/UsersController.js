const { hash, compare } = require('bcryptjs');

const AppError = require('../utils/AppError');

const knex = require("../database/knex");

class UsersController{

    async create(request, response){
        const { name, email, password, avatar } = request.body;
        const checkUserExists = await knex("users").where({ email }).first();

        if (checkUserExists){
            throw new AppError("Este e-mail já está em uso.");
        }
        
        const hashedPassword = await hash(password, 8);

        await knex("users").insert({name, email, password: hashedPassword, avatar});

        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, password, old_password, avatar } = request.body;
        const { id } = request.params;

        const user = await knex("users").where({ id }).first();
   
        if(!user) {
         throw new AppError("Usuário não encontrado");
        }
        
        user.name = name ?? user.name;
        user.email= email ?? user.email;
        user.avatar = avatar ?? user.avatar;

        if(password && !old_password) {
            throw new AppError("Você informar a senha antiga para definir a nova senha");
           }
      
           if(password && old_password) {
                const checkOldPassword = await compare(old_password, user.password);
        
                if(!checkOldPassword) {
                throw new AppError("A senha antiga não confere.");
                }
        
                user.password = await hash(password, 8);
           }
   
        await knex("users")
            .where({id : id})
            .update({name: user.name, email: user.email, password: user.password, avatar:user.avatar, updated_at: knex.fn.now()});
   
       return response.json();
     }

    async show(request, response) {
        const users = await knex("users");
    
        return response.json({...users});
    }

    async delete(request, response) {
        const { id } = request.params;
    
        await knex("users").where({ id }).delete();
    
        return response.json();
    }
}

module.exports = UsersController;