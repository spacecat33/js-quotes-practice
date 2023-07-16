document.addEventListener("DOMContentLoaded", () => {
    const quoteUrl = 'http://localhost:3000/quotes?_embed=likes';
    const quoteList = document.querySelector('#quote-list');
    const quoteForm = document.querySelector('#new-quote-form');
    const sortButton = document.querySelector('#sort-button');
    let isSorted = false;
  
    fetchQuotes();
  
    quoteForm.addEventListener('submit', event => {
      event.preventDefault();
      createQuote();
    });
  
    quoteList.addEventListener('click', event => {
      const target = event.target;
  
      if (target.matches('.btn-danger')) {
        deleteQuote(event);
      } else if (target.matches('.btn-success')) {
        likeQuote(event);
      } else if (target.matches('.btn-edit')) {
        toggleEditForm(event);
      }
    });
  
    function fetchQuotes() {
      const url = isSorted
        ? 'http://localhost:3000/quotes?_sort=author&_embed=likes'
        : 'http://localhost:3000/quotes?_embed=likes';
  
      fetch(url)
        .then(resp => resp.json())
        .then(renderQuotes);
    }
  
    function renderQuotes(quotes) {
      quoteList.innerHTML = '';
      quotes.forEach(renderQuote);
    }
  
    function renderQuote(quote) {
      const quoteCard = document.createElement('li');
      quoteCard.className = 'quote-card';
      quoteCard.dataset.id = quote.id;
  
      quoteCard.innerHTML = `
        <blockquote class="blockquote">
          <p class="mb-0">${quote.quote}</p>
          <footer class="blockquote-footer">${quote.author}</footer>
          <br>
          <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
          <button class='btn-danger'>Delete</button>
          <button class='btn-edit'>Edit</button>
        </blockquote>
      `;
  
      quoteList.append(quoteCard);
    }
  
    function createQuote() {
      const newQuote = quoteForm.elements.quote.value;
      const newAuthor = quoteForm.elements.author.value;
  
      const newQuoteObj = {
        quote: newQuote,
        author: newAuthor,
        likes: [],
      };
  
      fetch('http://localhost:3000/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuoteObj),
      })
        .then(resp => resp.json())
        .then(() => fetchQuotes());
  
      quoteForm.reset();
    }
  
    function deleteQuote(event) {
      const quoteId = event.target.parentElement.parentElement.dataset.id;
      fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: 'DELETE',
      })
        .then(resp => {
          if (resp.ok) {
            event.target.parentElement.parentElement.remove();
          }
        });
    }
  
    function likeQuote(event) {
      const quoteId = event.target.parentElement.parentElement.dataset.id;
      fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: parseInt(quoteId),
          createdAt: Math.floor(new Date().getTime() / 1000),
        }),
      })
        .then(resp => resp.json())
        .then(() => {
          fetch(`http://localhost:3000/quotes/${quoteId}?_embed=likes`)
            .then(resp => resp.json())
            .then(updatedQuote => {
              const likesCounter = event.target.querySelector('span');
              likesCounter.textContent = updatedQuote.likes.length;
            });
        });
    }
  
    function toggleEditForm(event) {
      const quoteId = event.target.parentElement.parentElement.dataset.id;
      let editForm = document.querySelector(`#edit-form-${quoteId}`);
  
      if (editForm) {
        editForm.remove();
      } else {
        const quoteText = event.target.parentElement.childNodes[1].textContent;
        const authorText = event.target.parentElement.childNodes[3].textContent;
  
        editForm = document.createElement('form');
        editForm.id = `edit-form-${quoteId}`;
        editForm.dataset.id = quoteId;
  
        editForm.innerHTML = `
          <label for='edit-quote'>Quote:</label><br>
          <input type='text' id='edit-quote' name='edit-quote' value='${quoteText}'><br>
          <label for='edit-author'>Author:</label><br>
          <input type='text' id='edit-author' name='edit-author' value='${authorText}'><br>
          <input type='submit' value='Update'>
        `;
  
        event.target.parentElement.parentElement.appendChild(editForm);
  
        editForm.addEventListener('submit', event => {
          event.preventDefault();
          const updatedQuote = event.target['edit-quote'].value;
          const updatedAuthor = event.target['edit-author'].value;
  
          const updatedQuoteObj = {
            quote: updatedQuote,
            author: updatedAuthor,
          };
  
          fetch(`http://localhost:3000/quotes/${quoteId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedQuoteObj),
          })
            .then(resp => resp.json())
            .then(() => fetchQuotes());
        });
      }
    }
  
    function toggleSorting() {
      isSorted = !isSorted;
  
      if (isSorted) {
        sortButton.textContent = 'Sort by ID';
      } else {
        sortButton.textContent = 'Sort by author';
      }
  
      fetchQuotes();
    }
  
    sortButton.addEventListener('click', toggleSorting);
    });