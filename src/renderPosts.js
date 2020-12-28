export default (posts) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.innerText = 'Posts';
  postsContainer.appendChild(postsTitle);

  const postsList = posts;
  console.log('postsList', postsList);
  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group');
  postsList.forEach((i) => {
    i.forEach((post) => {
      const item = document.createElement('li');
      item.setAttribute('class', 'list-group-item');
      const itemElLink = document.createElement('a');
      itemElLink.setAttribute('href', post.itemLink);
      itemElLink.innerHTML = post.itemTitle;
      item.appendChild(itemElLink);
      list.appendChild(item);
    });
  });
  postsContainer.appendChild(list);
};
