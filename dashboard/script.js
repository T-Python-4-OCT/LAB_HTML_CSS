lucide.createIcons();

const searchBox = document.getElementById('searchBox');
const items = document.querySelectorAll('.search-item');

searchBox.addEventListener('input', function (e) {
    const value = e.target.value.toLowerCase();
    items.forEach(function (item) {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(value) ? '' : 'none';
    });
});

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks.forEach(function (l) {
            l.classList.remove('bg-orange-50', 'text-orange-600', 'font-semibold', 'border-r-4', 'border-orange-500');
        });
        link.classList.add('bg-orange-50', 'text-orange-600', 'font-semibold', 'border-r-4', 'border-orange-500');
    });
});