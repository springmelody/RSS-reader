export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const items = doc.querySelectorAll('item');
  const itemsInfo = [...items].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDate = new Date(item.querySelector('pubDate').textContent);
    return {
      itemTitle, itemLink, itemDate,
    };
  });

  return {
    title, description, itemsInfo,
  };
};
