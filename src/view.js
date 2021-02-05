import onChange from 'on-change';
import i18next from 'i18next';

export default (state, elements) => {
  const {
    input,
    submitButton,
    feedbackContainer,
    modal,
  } = elements;

  const renderFeeds = (feeds) => {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = '';
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18next.t('feedsTitle');
    feedsContainer.appendChild(feedsTitle);

    const list = document.createElement('ul');
    list.setAttribute('class', 'list-group mb-5');
    feeds.forEach((el) => {
      const item = document.createElement('li');
      item.setAttribute('class', 'list-group-item');
      const itemTitle = document.createElement('h3');
      itemTitle.textContent = el.title;
      item.appendChild(itemTitle);
      const itemDescEl = document.createElement('p');
      itemDescEl.textContent = el.description;
      item.appendChild(itemDescEl);
      list.appendChild(item);
      feedsContainer.appendChild(list);
    });
  };

  const renderPosts = (watchedState) => {
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = '';
    const postsTitle = document.createElement('h2');
    postsTitle.textContent = i18next.t('postsTitle');
    postsContainer.appendChild(postsTitle);
    const postsList = watchedState.rssContent.posts;
    const listEl = document.createElement('ul');
    listEl.setAttribute('class', 'list-group');
    postsList.forEach((post) => {
      const itemEL = document.createElement('li');
      itemEL.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      const itemElLink = document.createElement('a');
      itemElLink.setAttribute('href', post.itemLink);
      const className = watchedState.rssContent.viewedPosts.has(Number(post.id)) ? 'font-weight-normal' : 'font-weight-bold';
      itemElLink.setAttribute('class', className);
      itemElLink.setAttribute('data-id', post.id);
      itemElLink.textContent = post.itemTitle;
      const itemElBtn = document.createElement('button');
      itemElBtn.setAttribute('class', 'btn btn-primary btn-sm');
      itemElBtn.setAttribute('data-toggle', 'modal');
      itemElBtn.setAttribute('data-target', '#modal');
      itemElBtn.setAttribute('data-id', post.id);
      itemElBtn.textContent = 'Preview';
      itemEL.appendChild(itemElLink);
      itemEL.appendChild(itemElBtn);
      listEl.appendChild(itemEL);
    });
    postsContainer.appendChild(listEl);
  };

  const handleProcessState = (watchedState) => {
    switch (watchedState.formProcessState) {
      case 'loading':
        submitButton.disabled = true;
        input.setAttribute('readonly', 'true');
        break;
      case 'idle':
        submitButton.disabled = false;
        input.removeAttribute('readonly');
        feedbackContainer.classList.remove('text-danger');
        feedbackContainer.classList.add('text-success');
        feedbackContainer.textContent = i18next.t('loaded');
        input.value = '';
        input.focus();
        break;
      case 'failed':
        submitButton.disabled = false;
        input.removeAttribute('readonly');
        feedbackContainer.classList.remove('text-success');
        feedbackContainer.classList.add('text-danger');
        input.classList.add('is-invalid');
        feedbackContainer.textContent = watchedState.form.errorType;
        break;
      default:
        throw new Error(`Unknown formProcessState: ${watchedState.formProcessState}`);
    }
  };

  const handleValid = (watchedState) => {
    if (watchedState.form.valid === 'valid') {
      input.classList.remove('is-invalid');
    } else if (watchedState.form.valid === 'invalid') {
      input.classList.add('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      feedbackContainer.textContent = watchedState.form.errorType;
    }
  };

  const renderModal = (watchedState) => {
    const { description, link, title } = watchedState.modal;
    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = title;
    const modalBody = modal.querySelector('.modal-body');
    modalBody.textContent = description;
    const modalLink = modal.querySelector('.full-article');
    modalLink.href = link;
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'formProcessState':
        handleProcessState(watchedState);
        break;
      case 'form.valid':
        handleValid(watchedState);
        break;
      case 'rssContent.posts':
        renderPosts(watchedState);
        break;
      case 'rssContent.feeds':
        renderFeeds(watchedState.rssContent.feeds);
        break;
      case 'rssContent.viewedPosts':
        renderPosts(watchedState);
        break;
      case 'modal':
        renderModal(watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
