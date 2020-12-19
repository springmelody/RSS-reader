const renderFeeds = (feeds) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.innerText = 'Feeds';
  feedsContainer.appendChild(feedsTitle);

  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group mb-5');
  feeds.map((el) => {
    console.log(el);
    const item = document.createElement('li');
    item.setAttribute('class', 'list-group-item');
    const itemTitle = document.createElement('h3');
    itemTitle.innerHTML = el.title;
    item.appendChild(itemTitle);
    const itemDescEl = document.createElement('p');
    itemDescEl.innerHTML = el.description;
    item.appendChild(itemDescEl);
    list.appendChild(item);
    feedsContainer.appendChild(list);
  });
}

const renderPosts = (posts) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postsList = posts;
  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group');

  postsList.map((item) => {
    item.map((post) => {
      const item = document.createElement('li');
      item.setAttribute('class', 'list-group-item');
      const itemElLink = document.createElement('a');
      itemElLink.setAttribute('href', post['itemLink']);
      itemElLink.innerHTML = post['itemTitle'];
      item.appendChild(itemElLink);
      list.appendChild(item);
    })
  });
  postsContainer.prepend(list);
};

export default (form) => {
  const { posts, feeds } = form;
  renderFeeds(feeds);
  renderPosts(posts);
}
