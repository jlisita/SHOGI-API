const { DataTypes } = require('sequelize');

module.exports = (sequelize, models) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    len: {
                        msg: "Le nom d'utilisateur doit avoir un nombre de caractères compris entre 0 et 50.",
                        args: [0, 50],
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: "email incorrect",
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                 validate: {
                isStrongEnough(value) {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
                if (!regex.test(value)) {
                    throw new Error("Le mot de passe doit comporter au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.");
                }
                },
            },
            },
            country: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            biography: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        msg: "Le texte doit avoir un nombre de caractères compris entre 0 et 700.",
                        args: [0, 700],
                    },
                },
            },
            avatar: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            onDelete: 'CASCADE',
            defaultScope: {
                attributes: { exclude: ['password'] },
            },
            scopes: {
                withPassword: {
                    attributes: {},
                },
            },
            hooks: {
                afterCreate: (record) => {
                    delete record.dataValues.password;
                },
                afterUpdate: (record) => {
                    delete record.dataValues.password;
                },
            },
        }
    );

    // Définition des relations
    User.associate = (models) => {
        User.belongsTo(models.Role, { foreignKey: { allowNull: false } });
        User.hasOne(models.UserStat, { foreignKey: 'UserId', allowNull: false });
        User.hasMany(models.UserActivity, { foreignKey: 'UserId', allowNull: false });
        User.hasMany(models.Topic, { foreignKey: 'UserId', allowNull: false });
        User.hasMany(models.Comment, { foreignKey: 'UserId', allowNull: false });
        User.hasMany(models.ScheduledGame, { foreignKey: 'OrganizerId', as: 'OrganizedGames' });
        User.hasMany(models.ScheduledGame, { foreignKey: 'ParticipantId', as: 'ParticipatedGames' });
    };

    return User;
};