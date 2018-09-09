export const batchMessages = async (keys, models) => {
  const messages = await models.Message.findAll({
    where: {
      userId: keys
    }
  });

  return keys.map(key => {
    let foundMessages = [];
    messages.forEach(message => {
      if (message.userId === key) {
        foundMessages.push(message.dataValues);
      }
    });
    return foundMessages;
  });
};
