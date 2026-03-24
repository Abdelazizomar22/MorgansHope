import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ChatMessageAttributes {
  id: number;
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id'> {}

class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes {
  public id!: number;
  public userId!: number;
  public role!: 'user' | 'assistant';
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    underscored: true,
  },
);

ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' });

export default ChatMessage;
