const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name = null,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: readPage === pageCount,
    reading,
    id,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.find(({ id: bookId }) => bookId === id);

  if (!isSuccess) {
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
  }

  const response = h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id,
    },
  });
  response.code(201);
  return response;
};

const getBooksHandler = (request) => {
  const {
    name: queryName = null,
    reading: queryReading = null,
    finished: queryFinished = null,
  } = request.query;

  let responseBooks = books;

  // Not using "else" to keep the response valid
  // When the request using more than one query

  // Check name query
  if (queryName) {
    responseBooks = responseBooks.filter(({ name }) => {
      // Set all name to lowercase to prevent case sensitive
      const searchedName = queryName.toLowerCase();
      return name.toLowerCase().includes(searchedName);
    });
  }

  // Check reading query
  if (queryReading === '0' || queryReading === '1') {
    responseBooks = responseBooks.filter(({ reading }) => {
      // Convert short int(0 or 1) into boolean
      const readingQueryOnBoolean = !!parseInt(queryReading, 10);
      return reading === readingQueryOnBoolean;
    });
  }

  // Check finished query
  if (queryFinished === '0' || queryFinished === '1') {
    responseBooks = responseBooks.filter(({ finished }) => {
      // Convert short int(0 or 1) into boolean
      const finishedQueryOnBoolean = !!parseInt(queryFinished, 10);
      return finished === finishedQueryOnBoolean;
    });
  }

  responseBooks = responseBooks.map(({ id, name, publisher }) => ({
    id,
    name,
    publisher,
  }));

  return {
    status: 'success',
    data: {
      books: responseBooks,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const { id: paramId } = request.params;

  const [book] = books.filter(({ id }) => id === paramId);

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id: paramId } = request.params;

  const {
    name = null,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex(({ id }) => id === paramId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id: paramId } = request.params;

  const index = books.findIndex(({ id }) => id === paramId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
