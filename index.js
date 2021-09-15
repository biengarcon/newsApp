const mybutton = document.getElementById('scroll-button');
const spinner = document.getElementById('spinner');
const clearSearch = document.getElementById('clear-search');

window.onscroll = scrollFunction;
window.onload = fetchTrendingNews;

function toggleMenu(event) {
	event.target.parentNode.classList.toggle('active');
}

function scrollFunction() {
  mybutton.style.display = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 ? 'block' : 'none';
}

function scrollUp() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function fetchTrendingNews() {
	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			spinner.hidden = true;

			masonNews(
				getNews(
					JSON.parse(this.responseText)
				)
			);
		}
	});

	xhr.open("GET", "https://webit-news-search.p.rapidapi.com/trending?language=en");
	xhr.setRequestHeader("x-rapidapi-key", "8dd4cede5bmsh76bd5b92fb9f320p1f2398jsne61bd43b6ffe");
	xhr.setRequestHeader("x-rapidapi-host", "webit-news-search.p.rapidapi.com");

	xhr.send();
}

function searchNews(phrase) {
	if (!phrase) return;

	spinner.hidden = false;

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			spinner.hidden = true;
			
			masonNews(
				getNews(
					JSON.parse(this.responseText)
				) || {}
			);
		}
	});

	xhr.open("GET", `https://webit-news-search.p.rapidapi.com/search?q=${phrase}&language=en&number=8&offset=0`);
	xhr.setRequestHeader("x-rapidapi-key", "98db12968bmsh98a37dfceaefd9bp1bc9eejsnb262d881485c");
	xhr.setRequestHeader("x-rapidapi-host", "webit-news-search.p.rapidapi.com");

	xhr.send();
}

function searchChange(value) {
	value ? clearSearch.classList.add('show') : clearSearch.classList.remove('show');
}

function resetSearch() {
	document.getElementById('search-box').value = '';
	clearSearch.classList.remove('show');

	fetchTrendingNews();
}

function getMostRecentNewsIndex(news) {
	let mostRecentDate = 0;
	let mostRecentNewsIndex = 0;

	news.forEach((item, index) => {
		const dateTime = new Date(item.date).getTime();

		if (dateTime > mostRecentDate) {
			mostRecentDate = dateTime;
			mostRecentNewsIndex = index;
		}
	});

	return mostRecentNewsIndex;
}

function shapeNews(news) {
	if (!news) return;

	const {author, date, title, description, image} = news;
	const dateParts = new Date(date).toDateString().split(' ').slice(1);
	dateParts[1] += 'th';

	return {
		author,
		title,
		description,
		image,
		publicationDate: dateParts.join(' ')
	};
}

function getNews(response) {
	const news = response.data.results;
	const mostRecentNewsIndex = getMostRecentNewsIndex(news);
	const mostRecentNews = shapeNews(news[mostRecentNewsIndex]);
	const trendingNews = [];

	news.forEach((item, index) => {
		if (index === mostRecentNewsIndex) return;

		trendingNews.push(shapeNews(item));
	});

	return {mostRecentNews, trendingNews};
}

function openArticle(author, title, description, image, publicationDate) {
	document.getElementById('main').classList.add('show-article');

	document.getElementById('article-image').src = image;
	document.getElementById('article-title').innerHTML = title;
	document.getElementById('article-author').innerHTML = author;
	document.getElementById('article-date').innerHTML = publicationDate;
	document.getElementById('article-description').innerHTML = description;
}

function mostRecentNewsTemplate({author, title, description, image, publicationDate}) {
	return `
		<div class="main-card-content">
			<h2>${title}</h2>
			<p>${description}</p>
			<div class="main-card-panel">
				<span>${publicationDate}</span>
				<a class="readmore" href="#" onclick="openArticle(\`${author}\`, \`${title}\`, \`${description}\`, \`${image}\`, \`${publicationDate}\`)">Read more</a>
			</div>
		</div>
		<div>
			<img src="${image}" class="main-card-image">
		</div>
	`
}

function trendingNewsTemplate({author, title, description, image, publicationDate}) {
	return `
		<div class="card">
			<div>
				<img src="${image}" class="image card-image">
			</div>
			<div class="card-content">
				<h3>${title}</h3>
				<p>${description}</p>
				<div class="card-panel">
					<span>${publicationDate}</span>
					<a class="readmore" href="#" onclick="openArticle(\`${author}\`, \`${title}\`, \`${description}\`, \`${image}\`, \`${publicationDate}\`)">Read more</a>
				</div>
			</div>
		</div>
	`;
}

function masonNews({mostRecentNews, trendingNews}) {
	if (!mostRecentNews || !trendingNews) return;

	document.getElementById('main-card').innerHTML = mostRecentNewsTemplate(mostRecentNews);

	trendingNews.forEach((news) => {
		document.getElementById('cards').innerHTML += trendingNewsTemplate(news);
	});
}