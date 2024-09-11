document.addEventListener("DOMContentLoaded", function () {
  // menyimpan data yang diinput
  const formTambahBuku = document.getElementById("bookForm");
  formTambahBuku.addEventListener("submit", function (event) {
    event.preventDefault();
    tambahBuku();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

let buku = [];
const RENDER = "render-buku";
const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "BOOK-SHELF_APP";

// TAMBAH BUKU -KRITERIA WAJIB #2
function tambahBuku() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const id = generateId();
  const bookObject = generateBookObject(id, title, author, year, isComplete);
  buku.push(bookObject);

  //   render data
  document.dispatchEvent(new Event(RENDER));
  document.getElementById("bookForm").reset();
  saveData();
}

// membuat id
function generateId() {
  return +new Date();
}

// membuat objek buku
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Buat list Buku
function createBookElement(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.textContent = bookObject.title;
  const bookAuthor = document.createElement("p");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookAuthor.textContent = bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.setAttribute("data-testid", "bookItemYear");
  bookYear.textContent = bookObject.year;

  const buttonAction = document.createElement("div");

  const trashButton = document.createElement("button");
  trashButton.textContent = "hapus";
  trashButton.classList.add("trash-button");
  trashButton.setAttribute("data-testid", "bookItemDeleteButton");
  trashButton.addEventListener("click", function () {
    removeTask(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("edit-button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.addEventListener("click", function () {
    editTask(bookObject.id);
  });

  //  KRITERIA WAJIB #4
  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.textContent = "Kembalikan";
    undoButton.classList.add("undo-button");
    undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    buttonAction.append(undoButton, trashButton, editButton);
  } else {
    // belum selesai dibaca -> selesai dibaca
    const checkButton = document.createElement("button");
    checkButton.textContent = "Dibaca";
    checkButton.classList.add("check-button");
    checkButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    buttonAction.append(checkButton, trashButton, editButton);
  }

  const bookActions = document.createElement("div");
  bookActions.append(bookTitle, bookAuthor, bookYear, buttonAction);
  bookActions.setAttribute("data-bookid", `${bookObject.id}`);
  bookActions.setAttribute("data-testid", "bookItem");
  return bookActions;
}

function addTaskToCompleted(bookId) {
  const bookIndex = buku.findIndex((book) => book.id === Number(bookId));
  if (bookIndex !== -1) {
    buku[bookIndex].isComplete = true;
  }
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookIndex = buku.findIndex((book) => book.id === Number(bookId));
  if (bookIndex !== -1) {
    buku[bookIndex].isComplete = false;
  }
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function removeTask(bookId) {
  const bookIndex = buku.findIndex((book) => book.id === Number(bookId));
  if (bookIndex !== -1) {
    buku.splice(bookIndex, 1);
  }
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function editTask(bookId) {
  const bookIndex = buku.findIndex((book) => book.id === Number(bookId));
  if (bookIndex !== -1) {
    const title = document.getElementById("bookFormTitle");
    const author = document.getElementById("bookFormAuthor");
    const year = document.getElementById("bookFormYear");
    title.value = buku[bookIndex].title;
    author.value = buku[bookIndex].author;
    year.value = buku[bookIndex].year;
    buku.splice(bookIndex, 1);
  }
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

const searchBar = document.getElementById("searchBook");
searchBar.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchInput = event.target.elements.searchBookTitle.value.toLowerCase();
  const bookFilter = buku.filter((book) =>
    book.title.toLowerCase().includes(searchInput)
  );
  if (bookFilter.length) {
    search(bookFilter);
  } else {
    doocument.dispatchEvent(new Event(RENDER));
  }
  event.target.reset();
});

function search(bookFilter) {
  const belumBaca = document.getElementById("incompleteBookList");
  belumBaca.innerHTML = "";

  const selesaiBaca = document.getElementById("completeBookList");
  selesaiBaca.innerHTML = "";

  for (const book of bookFilter) {
    if (book.isComplete) {
      selesaiBaca.append(createBookElement(book));
    } else {
      belumBaca.append(createBookElement(book));
    }
  }
}

// simpan data ke lokal storage (Wajib #1)
document.addEventListener(RENDER, function () {
  // 2 rak buku (Wajib #3)
  const belumBaca = document.getElementById("incompleteBookList");
  belumBaca.innerHTML = "";
  const selesaiBaca = document.getElementById("completeBookList");
  selesaiBaca.innerHTML = "";

  for (const book of buku) {
    if (book.isComplete) {
      selesaiBaca.append(createBookElement(book));
    } else {
      belumBaca.append(createBookElement(book));
    }
  }
});

// Simpan Data
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(buku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

// load data
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      buku.push(todo);
    }
  }
  document.dispatchEvent(new Event(RENDER));
}

// function isStorageExist
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}
