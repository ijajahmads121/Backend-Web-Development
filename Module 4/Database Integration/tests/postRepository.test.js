const test = require('node:test');
const assert = require('node:assert/strict');
const createPostRepository = require('../src/repositories/createPostRepository');

function makeClient(overrides = {}) {
  const calls = [];
  const defaults = {
    findMany: async (args) => {
      calls.push(['findMany', args]);
      return [];
    },
    findUnique: async (args) => {
      calls.push(['findUnique', args]);
      return null;
    },
    create: async (args) => {
      calls.push(['create', args]);
      return { id: 3, ...args.data, createdAt: new Date() };
    },
    update: async (args) => {
      calls.push(['update', args]);
      return { id: args.where.id, ...args.data };
    },
    delete: async (args) => {
      calls.push(['delete', args]);
      return { id: args.where.id };
    },
  };
  return {
    client: { post: { ...defaults, ...overrides } },
    calls,
  };
}

test('findAll returns an array and requests stable ascending order', async () => {
  const { client, calls } = makeClient();
  const repository = createPostRepository(client);

  assert.deepEqual(await repository.findAll(), []);
  assert.deepEqual(calls, [['findMany', { orderBy: { id: 'asc' } }]]);
});

test('findById converts numeric IDs and returns null for invalid IDs', async () => {
  const { client, calls } = makeClient({
    findUnique: async (args) => {
      calls.push(['findUnique', args]);
      return { id: args.where.id };
    },
  });
  const repository = createPostRepository(client);

  assert.deepEqual(await repository.findById('7'), { id: 7 });
  assert.equal(await repository.findById('not-a-number'), null);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], ['findUnique', { where: { id: 7 } }]);
});

test('create returns the full created record and defaults the body', async () => {
  const { client, calls } = makeClient();
  const repository = createPostRepository(client);

  const created = await repository.create({ title: 'Hello', authorId: '1' });
  assert.equal(created.id, 3);
  assert.equal(created.body, '');
  assert.deepEqual(calls[0], [
    'create',
    { data: { title: 'Hello', body: '', authorId: 1 } },
  ]);
});

test('create rejects missing author identity with a safe client error', async () => {
  const { client, calls } = makeClient();
  const repository = createPostRepository(client);

  await assert.rejects(repository.create({ title: 'Hello' }), {
    statusCode: 422,
    message: 'A valid authorId is required',
  });
  assert.equal(calls.length, 0);
});

test('update writes only contract fields and returns null when the row disappears', async () => {
  const { client, calls } = makeClient({
    update: async (args) => {
      calls.push(['update', args]);
      const error = new Error('private database detail');
      error.code = 'P2025';
      throw error;
    },
  });
  const repository = createPostRepository(client);

  assert.equal(await repository.update(9, { body: 'edited', authorId: 77 }), null);
  assert.deepEqual(calls, [['update', { where: { id: 9 }, data: { body: 'edited' } }]]);
});

test('remove returns true on success and false for a missing record', async () => {
  let shouldBeMissing = false;
  const { client, calls } = makeClient({
    delete: async (args) => {
      calls.push(['delete', args]);
      if (shouldBeMissing) {
        const error = new Error('private database detail');
        error.code = 'P2025';
        throw error;
      }
      return { id: args.where.id };
    },
  });
  const repository = createPostRepository(client);

  assert.equal(await repository.remove('4'), true);
  shouldBeMissing = true;
  assert.equal(await repository.remove('4'), false);
});

test('unique and foreign-key failures are mapped without database details', async () => {
  const uniqueError = new Error('sensitive constraint name');
  uniqueError.code = 'P2002';
  uniqueError.meta = { target: ['private_column'] };
  const uniqueRepository = createPostRepository(makeClient({
    create: async () => { throw uniqueError; },
  }).client);

  await assert.rejects(uniqueRepository.create({ title: 'T', authorId: 1 }), (error) => {
    assert.equal(error.statusCode, 409);
    assert.equal(error.message, 'A record with these values already exists');
    assert.equal(error.message.includes('private'), false);
    return true;
  });

  const foreignKeyError = new Error('sensitive foreign key details');
  foreignKeyError.code = 'P2003';
  const foreignKeyRepository = createPostRepository(makeClient({
    create: async () => { throw foreignKeyError; },
  }).client);

  await assert.rejects(foreignKeyRepository.create({ title: 'T', authorId: 999 }), (error) => {
    assert.equal(error.statusCode, 422);
    assert.equal(error.message, 'A referenced record does not exist or cannot be removed');
    assert.equal(error.message.includes('sensitive'), false);
    return true;
  });
});
