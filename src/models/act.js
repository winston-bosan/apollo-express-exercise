const act = (sequelize, DataTypes) => {
  const Act = sequelize.define("act", {
    content: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: false
        }
      }
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "An act has to have a title that is not empty."
        }
      }
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          args: true,
          msg: "An act has to have a sort order that is not empty."
        }
      }
    }
  });

  Act.associate = models => {
    Act.belongsTo(models.User);
    Act.hasMany(models.Movement);
  };

  return Act;
};

export default act;
