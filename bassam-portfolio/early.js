/* Runs before first paint: language, theme and the welcome-dialog flag. */
(function () {
  var H = document.documentElement;
  try {
    var l = localStorage.getItem('lang') || ((navigator.language || '').slice(0, 2) === 'ar' ? 'ar' : 'en');
    H.lang = l; H.dir = l === 'ar' ? 'rtl' : 'ltr';
    var th = localStorage.getItem('theme');
    if (th === 'light' || th === 'dark') H.setAttribute('data-theme', th);
  } catch (e) {}
  try {
    if (!sessionStorage.getItem('welcomed')) H.classList.add('welcome');
  } catch (e) { H.classList.add('welcome'); }
})();
