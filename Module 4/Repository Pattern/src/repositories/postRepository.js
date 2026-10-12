
const initialPosts = [
  {
    id: 1,
    title: 'First post',
    body: 'Repository boundaries protect change.',
    authorId: 7,
  },
  {
    id: 2,
    title: 'Second post',
    body: 'Services should speak in domain language.',
    authorId: 8,
  },
];

// Only this repository knows that storage uses a Map.
// Switching to Prisma later should change this file,
// not the service, controller, or routes.
const posts = new Map(
  initialPosts.map((post) => [post.id, post])
);

let nextId = 3;

function findAll() {
  return Array.from(posts.values());
}

function findById(id) {
  return posts.get(Number(id)) || null;
}

function create(fields) {
  const post = { id: nextId++, ...fields };
  posts.set(post.id, post);
  return post;
}

function update(id, patch) {
  const postId = Number(id);
  const existingPost = posts.get(postId);

  if (!existingPost) return null;

  const updatedPost = { ...existingPost, ...patch };
  posts.set(postId, updatedPost);

  return updatedPost;
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
