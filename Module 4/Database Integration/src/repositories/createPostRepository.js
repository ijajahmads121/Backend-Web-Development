const { translatePrismaError } = require('../utils/prismaError');

function asId(id) {
  const value = Number(id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function createPostRepository(client) {
  async function findAll() {
    try {
      return await client.post.findMany({ orderBy: { id: 'asc' } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async function findById(id) {
    const postId = asId(id);
    if (postId === null) return null;

    try {
      return await client.post.findUnique({ where: { id: postId } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async function create(fields) {
    const authorId = Number(fields && fields.authorId);
    if (!Number.isSafeInteger(authorId) || authorId <= 0) {
      const error = new Error('A valid authorId is required');
      error.statusCode = 422;
      throw error;
    }

    try {
      return await client.post.create({
        data: {
          title: fields.title,
          body: fields.body || '',
          authorId,
        },
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async function update(id, patch) {
    const postId = asId(id);
    if (postId === null) return null;

    const data = {};
    if (patch && patch.title !== undefined) data.title = patch.title;
    if (patch && patch.body !== undefined) data.body = patch.body;
    if (Object.keys(data).length === 0) return findById(postId);

    try {
      return await client.post.update({ where: { id: postId }, data });
    } catch (error) {
      if (error && error.code === 'P2025') return null;
      throw translatePrismaError(error);
    }
  }

  async function remove(id) {
    const postId = asId(id);
    if (postId === null) return false;

    try {
      await client.post.delete({ where: { id: postId } });
      return true;
    } catch (error) {
      if (error && error.code === 'P2025') return false;
      throw translatePrismaError(error);
    }
  }

  return { findAll, findById, create, update, remove };
}

module.exports = createPostRepository;
