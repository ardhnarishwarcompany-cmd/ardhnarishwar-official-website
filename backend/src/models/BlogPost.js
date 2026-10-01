const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlogPost = sequelize.define('BlogPost', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  excerpt: { type: DataTypes.STRING(500), allowNull: true },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  coverImageUrl: { type: DataTypes.STRING, allowNull: true },
  author: { type: DataTypes.STRING, allowNull: true },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'blog_posts',
  timestamps: true,
});

module.exports = BlogPost;
