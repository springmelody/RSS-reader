export default (state) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.innerText = 'Posts';
  postsContainer.appendChild(postsTitle);

  const postsList = state.rssContent.posts;
  const listEl = document.createElement('ul');
  listEl.setAttribute('class', 'list-group');
  postsList.forEach((post) => {
    const itemEL = document.createElement('li');
    itemEL.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    const itemElLink = document.createElement('a');
    itemElLink.setAttribute('href', post.itemLink);
    if (!state.rssContent.viewedPosts.includes(Number(post.id))) {
      itemElLink.setAttribute('class', 'font-weight-bold');
    }
    itemElLink.setAttribute('data-id', post.id);
    itemElLink.innerHTML = post.itemTitle;
    const itemElBtn = document.createElement('button');
    itemElBtn.setAttribute('class', 'btn btn-primary btn-sm');
    itemElBtn.setAttribute('data-toggle', 'modal');
    itemElBtn.setAttribute('data-target', '#modalPreview');
    itemElBtn.setAttribute('data-id', post.id);
    itemElBtn.innerHTML = 'Preview';
    itemEL.appendChild(itemElLink);
    itemEL.appendChild(itemElBtn);
    listEl.appendChild(itemEL);
  });
  postsContainer.appendChild(listEl);
};
