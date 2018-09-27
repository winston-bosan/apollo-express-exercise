const list = (sequelize, DataTypes) => {
  const List = sequelize.define("list", {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "A list has to have a title that is not empty."
        }
      }
    },
    actLimit: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          args: true,
          msg: "A list has to have a actLimit thats not null."
        }
      }
    },
    sortOrder: {
      type: DataTypes.FLOAT,
      validate: {
        notEmpty: {
          args: true,
          msg: "A list has to have a sort order that is not empty."
        }
      }
    }
  });

  List.associate = models => {
    List.belongsTo(models.User);
    List.hasMany(models.Act);
  };

  return List;
};

export default list;
