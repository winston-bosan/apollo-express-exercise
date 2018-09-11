const movement = (sequelize, DataTypes) => {
    const Movement = sequelize.define("movement", {
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
            msg: "An movement has to have a title that is not empty."
          }
        }
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  
    Movement.associate = models => {
      Movement.belongsTo(models.Act);
    };
  
    return Movement;
  };
  
  export default movement;
  