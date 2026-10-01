const slugify = require('slugify');
const BlogPost = require('../models/BlogPost');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const posts = await BlogPost.findAll({
      where,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not load blog posts.', details: err.message });
  }
}

async function getBySlug(req, res) {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Could not load post.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    if (body.isPublished && !body.publishedAt) {
      body.publishedAt = new Date();
    }
    const post = await BlogPost.create(body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: 'Could not create post.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const body = { ...req.body };
    if (body.title && !body.slug) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    if (body.isPublished && !post.publishedAt) {
      body.publishedAt = new Date();
    }
    await post.update(body);
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: 'Could not update post.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    await post.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete post.', details: err.message });
  }
}

module.exports = { list, getBySlug, create, update, remove };
